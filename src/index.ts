import inquirer from "inquirer";
import { authorizeWithCredentials, authorizeWithMfaCode } from "./auth";
import { getAccessTokenHeader, getRegionAndShardFromPas } from "./helpers";
import { RIOT_USER_INFO_ENDPOINT, httpClient } from "./client";

const RIOT_USERNAME = process.env.RIOT_USERNAME;
const RIOT_PASSWORD = process.env.RIOT_PASSWORD;

if (!(RIOT_USERNAME && RIOT_PASSWORD)) {
	console.log("Error: Provide username and password");
	console.log("Either edit the script or use ENV variables.");
	console.log(
		`For setting ENV variables in Powershell use,\n($env:RIOT_USERNAME="123") -and ($env:RIOT_PASSWORD="XYZ")`
	);
	process.exit(1);
}

console.log("Authenticating...");

let authResult = await authorizeWithCredentials(RIOT_USERNAME, RIOT_PASSWORD);

if (authResult.type === "mfa") {
	const { code } = await inquirer.prompt({
		type: "input",
		name: "code",
		message: "Enter MFA code",
	});

	authResult = await authorizeWithMfaCode(authResult.data.asidCookie, code);
}

const { accessToken, idToken } = authResult.data;

const userInfoResponse = await httpClient(RIOT_USER_INFO_ENDPOINT, {
	headers: {
		...getAccessTokenHeader(accessToken),
	},
});

console.log(
	`Logged in as ${userInfoResponse.data.acct.game_name}#${userInfoResponse.data.acct.tag_line}`
);

const { region, shard } = await getRegionAndShardFromPas(accessToken, idToken);

console.log(`Detected Region: ${region}, Shard: ${shard}`);
