import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";

export async function GET(request: NextRequest) {
    try {
        const sessionId = request.cookies.get("twitter_session")?.value;

        if (!sessionId) {
            return NextResponse.json(
                { error: "No session found" },
                { status: 401 }
            );
        }

        const session = getSession(sessionId);

        if (!session) {
            return NextResponse.json(
                { error: "Invalid session" },
                { status: 401 }
            );
        }

        return NextResponse.json(session.user);
    } catch (error) {
        console.error("Get user error:", error);
        return NextResponse.json(
            { error: "Failed to get user info" },
            { status: 500 }
        );
    }
}
