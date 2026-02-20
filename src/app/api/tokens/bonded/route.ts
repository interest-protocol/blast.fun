import { NextResponse } from "next/server"

export const revalidate = 5

export async function GET() {
	return NextResponse.json([], {
		headers: {
			"Cache-Control": "public, s-maxage=5, stale-while-revalidate=59"
		}
	})
}