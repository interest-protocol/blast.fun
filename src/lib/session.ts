import { TwitterUser } from "@/types/twitter";

export interface SessionData {
    user: TwitterUser;
    accessToken: string;
    expiresAt: number;
}

// todo: replace this with redis before we go to prod, but for quick iteration this works for now!!
const sessions = new Map<string, SessionData>();

export function createSession(
    sessionId: string,
    user: TwitterUser,
    accessToken: string
): void {
    sessions.set(sessionId, {
        user,
        accessToken,
        expiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
    });
}

export function getSession(sessionId: string): SessionData | null {
    const session = sessions.get(sessionId);

    if (!session) {
        return null;
    }

    if (Date.now() > session.expiresAt) {
        sessions.delete(sessionId);
        return null;
    }

    return session;
}

export function deleteSession(sessionId: string): void {
    sessions.delete(sessionId);
}
