import type { AxiosError, AxiosResponse } from "axios";
import {
	RIOT_AUTHORIZATION_ENDPOINT,
	RIOT_ENTITLEMENTS_ENDPOINT,
	RIOT_REAUTHORIZATION_ENDPOINT,
	httpClient,
} from "./client";
import {
	extractCookie,
	getPuuidFromAccessToken,
	isMfaResponse,
	isTokenResponse,
	parseTokensFromResponse,
	getAccessTokenHeader,
	parseTokensFromUri,
} from "./helpers";
import type { ValorantAuthResponse, AuthTokenResponse } from "./types";

export async function authorizeWithCredentials(
	username: string,
	password: string
) {
	const cookieResponse = await httpClient(RIOT_AUTHORIZATION_ENDPOINT, {
		method: "POST",
		data: {
			client_id: "play-valorant-web-prod",
			nonce: "1",
			redirect_uri: "https://playvalorant.com/opt_in",
			response_type: "token id_token",
			scope: "account openid",
		},
	});

	let asidCookie = extractCookie("asid", cookieResponse);

	const authResponse = await httpClient<ValorantAuthResponse>(
		RIOT_AUTHORIZATION_ENDPOINT,
		{
			method: "PUT",
			data: {
				language: "en_US",
				remember: true,
				type: "auth",
				username,
				password,
			},
			headers: {
				Cookie: asidCookie,
			},
		}
	);

	if (isMfaResponse(authResponse)) {
		const asidCookie = extractCookie("asid", authResponse);

		return {
			type: "mfa" as const,
			data: { asidCookie },
		};
	}

	if (isTokenResponse(authResponse)) {
		return { type: "auth" as const, data: await parseAuthData(authResponse) };
	}

	throw Error("Authorization failed");
}

export async function authorizeWithMfaCode(
	asidCookie: string,
	mfaCode: string
) {
	const authResponse = await httpClient(RIOT_AUTHORIZATION_ENDPOINT, {
		method: "PUT",
		data: {
			type: "multifactor",
			code: mfaCode,
			rememberDevice: true,
		},
		headers: {
			Cookie: asidCookie,
		},
	});

	if (isTokenResponse(authResponse)) {
		return { type: "auth" as const, data: await parseAuthData(authResponse) };
	}

	throw Error("Authorization failed");
}

export async function reAuthorizeFromCookies(ssidCookie: string) {
	const reauthResponseUri = await httpClient(RIOT_REAUTHORIZATION_ENDPOINT, {
		method: "GET",
		maxRedirects: 0,
		validateStatus: status => status === 303,
		headers: {
			Cookie: ssidCookie,
		},
	})
		.then(res => res.headers["location"])
		.catch((err: AxiosError) => err.response?.headers["location"]);

	const { accessToken, idToken } = parseTokensFromUri(reauthResponseUri);

	return {
		idToken,
		accessToken,
		entitlementsToken: await getEntitlementsToken(accessToken),
	};
}

export async function getEntitlementsToken(accessToken: string) {
	const entitlementsResponse = await httpClient<{ entitlements_token: string }>(
		RIOT_ENTITLEMENTS_ENDPOINT,
		{
			method: "POST",
			headers: {
				...getAccessTokenHeader(accessToken),
			},
		}
	);

	return entitlementsResponse.data.entitlements_token;
}

export async function parseAuthData(
	authResponse: AxiosResponse<AuthTokenResponse>
) {
	const ssidCookie = extractCookie("ssid", authResponse);
	const { accessToken, idToken } = parseTokensFromResponse(authResponse);

	return {
		puuid: getPuuidFromAccessToken(accessToken),
		ssidCookie,
		accessToken,
		idToken,
		entitlementsToken: await getEntitlementsToken(accessToken),
	};
}
