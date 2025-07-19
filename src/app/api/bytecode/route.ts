import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
	const { searchParams } = new URL(request.url)
	const type = searchParams.get("type") || "coin"

	try {
		const response = await fetch(`https://token-generator-api-production.up.railway.app/api/bytecode/${type}`)

		if (!response.ok) {
			throw new Error(`Failed to fetch bytecode: ${response.status}`)
		}

		const bytecode = await response.text()

		return new NextResponse(bytecode, {
			status: 200,
			headers: {
				"Content-Type": "text/plain",
			},
		})
	} catch (error) {
		console.error("Error fetching bytecode:", error)
		return NextResponse.json({ error: "Failed to fetch bytecode" }, { status: 500 })
	}
}
