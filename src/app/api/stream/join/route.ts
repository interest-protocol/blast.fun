import { NextResponse } from "next/server"
import { LiveKitController, JoinStreamParams } from "@/lib/livekit-controller"

export async function POST(req: Request) {
	const controller = new LiveKitController()

	try {
		const reqBody = await req.json()
		const response = await controller.joinStream(reqBody as JoinStreamParams)
		return NextResponse.json(response)
	} catch (err) {
		if (err instanceof Error) {
			return new NextResponse(err.message, { status: 500 })
		}
		return new NextResponse(null, { status: 500 })
	}
}