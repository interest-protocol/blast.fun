import { auth } from "@/auth"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import type { NextMiddleware } from "next/server"

const authMiddleware = auth as NextMiddleware

export async function middleware(request: NextRequest) {
	const { pathname } = request.nextUrl

	// Allow access to coming-soon page and auth endpoints
	if (
		pathname === "/coming-soon" ||
		pathname.startsWith("/api/auth/")
	) {
		return NextResponse.next()
	}

	// Check for site access cookie
	const hasAccess = request.cookies.get("site-access")?.value === "granted"

	if (!hasAccess) {
		const url = request.nextUrl.clone()
		url.pathname = "/coming-soon"
		return NextResponse.redirect(url)
	}

	// If password is correct, continue with NextAuth middleware
	// Create a dummy event for the auth middleware
	const event = { request } as any
	return authMiddleware(request, event)
}

export const config = {
	matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
