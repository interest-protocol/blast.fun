import { NextRequest, NextResponse } from "next/server";
import { deleteSession } from "@/lib/session";

export async function POST(request: NextRequest) {
    try {
        const sessionId = request.cookies.get("twitter_session")?.value;

        if (sessionId) {
            deleteSession(sessionId);
        }

        const response = NextResponse.json({ success: true });
        response.cookies.delete("twitter_session");

        return response;
    } catch (error) {
        console.error("Logout error:", error);
        return NextResponse.json(
            { error: "Failed to logout" },
            { status: 500 }
        );
    }
}
