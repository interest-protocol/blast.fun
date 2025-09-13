import { NextRequest, NextResponse } from "next/server"

export function middleware(req: NextRequest) {
	// @dev: Let the auth handling happen in the app, not in middleware
	// @dev: Database sessions don't work well with edge middleware
	return NextResponse.next()
}

export const config = {
	matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}