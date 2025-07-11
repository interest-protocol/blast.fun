import { NextRequest, NextResponse } from "next/server";
import { TwitterOAuth } from "@/lib/twitter";
import {
    generateCodeVerifier,
    generateCodeChallenge,
    generateState,
} from "@/lib/crypto";

export async function POST(request: NextRequest) {
    try {
        const twitter = new TwitterOAuth();

        const codeVerifier = generateCodeVerifier();
        const codeChallenge = generateCodeChallenge(codeVerifier);
        const state = generateState();

        const authUrl = twitter.generateAuthUrl(state, codeChallenge);
        const response = NextResponse.json({ authUrl });

        // store code verifier and state in httpOnly cookies
        response.cookies.set("twitter_code_verifier", codeVerifier, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 10 * 60, // 10 mins
        });

        response.cookies.set("twitter_state", state, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 10 * 60, // 10 mins
        });

        return response;
    } catch (error) {
        console.error("Twitter login error:", error);
        return NextResponse.json(
            { error: "Failed to initiate Twitter login" },
            { status: 500 }
        );
    }
}
