import type { AxiosResponse } from "axios";

export type AuthParameters = {
	uri: string;
};

export type AuthResponse = {
	mode: string;
	parameters: AuthParameters;
};

export type AuthMultifactor = {
	email: string;
	method: string;
	methods: string[];
	multiFactorCodeLength: number;
	mfaVersion: string;
};

export type AuthTokenResponse = {
	type: "response";
	response: AuthResponse;
	country: string;
};

export interface AuthMFAResponse {
	type: "multifactor";
	multifactor: AuthMultifactor;
	country: string;
	securityProfile: string;
}

export type ValorantAuthResponse = AuthTokenResponse | AuthMFAResponse;

export type AuthData = {
	puuid: string;
	ssidCookie: string;
	accessToken: string;
	idToken: string;
	entitlementsToken: string;
};
