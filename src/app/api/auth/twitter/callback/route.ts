import { NextRequest, NextResponse } from "next/server";
import { TwitterOAuth } from "@/lib/twitter";
import { createSession } from "@/lib/session";
import crypto from "crypto";

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const code = searchParams.get("code");
        const state = searchParams.get("state");

        if (!code || !state) {
            return NextResponse.redirect(
                new URL("/?error=missing_params", request.url)
            );
        }

        const codeVerifier = request.cookies.get(
            "twitter_code_verifier"
        )?.value;
        const storedState = request.cookies.get("twitter_state")?.value;

        if (!codeVerifier || !storedState || state !== storedState) {
            return NextResponse.redirect(
                new URL("/?error=invalid_state", request.url)
            );
        }

        const twitter = new TwitterOAuth();
        const accessToken = await twitter.exchangeCodeForToken(
            code,
            codeVerifier
        );
        const user = await twitter.getUserInfo(accessToken);

        // generate random uuid and create the user session
        const sessionId = crypto.randomUUID();
        createSession(sessionId, user, accessToken);

        const response = NextResponse.redirect(new URL("/", request.url));

        response.cookies.set("twitter_session", sessionId, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 24 * 60 * 60, // 24 hours
        });

        // cleanup temp cookies
        response.cookies.delete("twitter_code_verifier");
        response.cookies.delete("twitter_state");

        return response;
    } catch (error) {
        console.error("Twitter callback error:", error);
        return NextResponse.redirect(
            new URL("/?error=auth_failed", request.url)
        );
    }
}
