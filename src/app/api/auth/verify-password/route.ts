import { env } from "@/env";
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(request: NextRequest) {
	try {
		const { password } = await request.json();
		const correctPassword = env.SITE_ACCESS_PASSWORD;

		if (!correctPassword) {
			return NextResponse.json(
				{ error: "Password not configured" },
				{ status: 500 }
			);
		}

		if (password === correctPassword) {
			const cookieStore = await cookies();
			cookieStore.set("site-access", "granted", {
				httpOnly: true,
				secure: process.env.NODE_ENV === "production",
				sameSite: "strict",
				maxAge: 60 * 60 * 24 * 1, // 1 day
				path: "/",
			});

			return NextResponse.json({ success: true });
		}

		return NextResponse.json(
			{ error: "Invalid password" },
			{ status: 401 }
		);
	} catch (error) {
		return NextResponse.json(
			{ error: "Invalid request" },
			{ status: 400 }
		);
	}
}