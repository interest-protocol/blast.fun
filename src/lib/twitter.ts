import { TwitterUser } from "@/types/twitter";

export class TwitterOAuth {
    private clientId: string;
    private clientSecret: string;
    private redirectUri: string;

    constructor() {
        this.clientId = process.env.TWITTER_CLIENT_ID!;
        this.clientSecret = process.env.TWITTER_CLIENT_SECRET!;
        this.redirectUri = process.env.TWITTER_REDIRECT_URI!;
    }

    generateAuthUrl(state: string, codeChallenge: string): string {
        const params = new URLSearchParams({
            response_type: "code",
            client_id: this.clientId,
            redirect_uri: this.redirectUri,
            scope: "tweet.read users.read follows.read",
            state,
            code_challenge: codeChallenge,
            code_challenge_method: "S256",
        });

        return `https://twitter.com/i/oauth2/authorize?${params.toString()}`;
    }

    async exchangeCodeForToken(
        code: string,
        codeVerifier: string
    ): Promise<string> {
        const response = await fetch("https://api.twitter.com/2/oauth2/token", {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                Authorization: `Basic ${Buffer.from(
                    `${this.clientId}:${this.clientSecret}`
                ).toString("base64")}`,
            },
            body: new URLSearchParams({
                grant_type: "authorization_code",
                client_id: this.clientId,
                redirect_uri: this.redirectUri,
                code,
                code_verifier: codeVerifier,
            }),
        });

        if (!response.ok) {
            throw new Error("Failed to exchange code for token");
        }

        const data = await response.json();
        return data.access_token;
    }

    async getUserInfo(accessToken: string): Promise<TwitterUser> {
        const response = await fetch(
            "https://api.twitter.com/2/users/me?user.fields=profile_image_url",
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            }
        );

        if (!response.ok) {
            throw new Error("Failed to fetch user info");
        }

        const data = await response.json();
        return {
            id: data.data.id,
            username: data.data.username,
            name: data.data.name,
            profile_image_url: data.data.profile_image_url,
        };
    }
}
