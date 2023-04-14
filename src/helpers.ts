import type { AxiosResponse } from "axios";
import type {
	ValorantAuthResponse,
	AuthTokenResponse,
	AuthMFAResponse,
} from "./types";
import axios from "axios";
import { regionShardMap } from "./regions";

export function extractCookie(
	cookieKey: string,
	response: { headers: any }
): string {
	const foundCookie = response.headers["set-cookie"]
		?.find((elem: string) => elem.startsWith(cookieKey))
		?.split(";")
		.at(0);

	if (!foundCookie) {
		throw Error(`Failed to extract ${cookieKey} cookie from response`);
	}

	return foundCookie;
}

export function getCookieValue(cookie: string) {
	return cookie.split("=")[1];
}

export function isTokenResponse(
	response: AxiosResponse<ValorantAuthResponse>
): response is AxiosResponse<AuthTokenResponse> {
	return response.data.type === "response";
}

export function isMfaResponse(
	response: AxiosResponse<ValorantAuthResponse>
): response is AxiosResponse<AuthMFAResponse> {
	return response.data.type === "multifactor";
}

export function getAccessTokenHeader(accessToken: string) {
	return {
		Authorization: accessToken.startsWith("Bearer")
			? accessToken
			: `Bearer ${accessToken}`,
	} as const;
}

export function parseTokensFromUri(uri: string) {
	let url = new URL(uri);
	let params = new URLSearchParams(url.hash.substring(1));
	const accessToken = params.get("access_token");
	const idToken = params.get("id_token");

	if (!accessToken) {
		throw Error("No Access token found in response");
	}

	if (!idToken) {
		throw Error("No Id token found in response");
	}

	return { accessToken, idToken };
}

export function parseTokensFromResponse<T extends { data: any }>(response: T) {
	return parseTokensFromUri(response.data.response.parameters.uri);
}

export async function fetchPas(accessToken: string, idToken: string) {
	const { data } = await axios<{
		token: string;
		affinities: { pbe: string; live: string };
	}>({
		url: "https://riot-geo.pas.si.riotgames.com/pas/v1/product/valorant",
		method: "PUT",
		headers: {
			Authorization: `Bearer ${accessToken}`,
		},
		data: {
			id_token: idToken,
		},
	});

	return data;
}

export async function getRegionAndShardFromPas(
	accessToken: string,
	idToken: string
) {
	const {
		affinities: { live: possibleRegion },
	} = await fetchPas(accessToken, idToken);

	const possibleRegionShardMapEntry = Object.entries(regionShardMap).find(
		([region]) => region === possibleRegion
	);

	if (!possibleRegionShardMapEntry) {
		throw Error(`Unable to find region shard for ${possibleRegion}`);
	}

	const region = possibleRegionShardMapEntry[0];
	const shard = possibleRegionShardMapEntry[1].at(0)!;

	return { region, shard };
}

export function getPuuidFromAccessToken(accessToken: string): string {
	return JSON.parse(Buffer.from(accessToken.split(".")[1], "base64").toString())
		.sub;
}
