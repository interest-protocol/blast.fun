import { NextRequest, NextResponse } from "next/server"
import NextAuth from "next-auth"
import authConfig from "@/auth.config"

const { auth } = NextAuth(authConfig)

export default auth((req: NextRequest) => {
	return NextResponse.next()
})

export const config = {
	matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
