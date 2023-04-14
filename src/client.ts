import axios from "axios";
import { Agent } from "https";

const DEFAULT_CIPHERS = [
	"ECDHE-ECDSA-CHACHA20-POLY1305",
	"ECDHE-RSA-CHACHA20-POLY1305",
	"ECDHE-ECDSA-AES128-GCM-SHA256",
	"ECDHE-RSA-AES128-GCM-SHA256",
	"ECDHE-ECDSA-AES256-GCM-SHA384",
	"ECDHE-RSA-AES256-GCM-SHA384",
	"ECDHE-ECDSA-AES128-SHA",
	"ECDHE-RSA-AES128-SHA",
	"ECDHE-ECDSA-AES256-SHA",
	"ECDHE-RSA-AES256-SHA",
	"AES128-GCM-SHA256",
	"AES256-GCM-SHA384",
	"AES128-SHA",
	"AES256-SHA",
	"DES-CBC3-SHA",
	"TLS_CHACHA20_POLY1305_SHA256",
	"TLS_AES_128_GCM_SHA256",
	"TLS_AES_256_GCM_SHA384",
];

const DEFAULT_USER_AGENT =
	"RiotClient/62.0.1.4852117.4789131 rso-auth (Windows;10;;Professional, x64)";

export const httpClient = axios.create({
	headers: {
		"User-Agent": DEFAULT_USER_AGENT,
		"Content-Type": "application/json",
	},
	httpsAgent: new Agent({
		ciphers: DEFAULT_CIPHERS.join(":"),
	}),
});

export const RIOT_AUTHORIZATION_ENDPOINT =
	"https://auth.riotgames.com/api/v1/authorization";
export const RIOT_ENTITLEMENTS_ENDPOINT =
	"https://entitlements.auth.riotgames.com/api/token/v1";
export const RIOT_REAUTHORIZATION_ENDPOINT =
	"https://auth.riotgames.com/authorize?redirect_uri=https%3A%2F%2Fplayvalorant.com%2Fopt_in&client_id=play-valorant-web-prod&response_type=token%20id_token&nonce=1";
export const RIOT_USER_INFO_ENDPOINT = "https://auth.riotgames.com/userinfo";
