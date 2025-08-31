import { NextResponse } from "next/server"
import { LiveKitController } from "@/lib/livekit-controller"

export async function GET() {
	const controller = new LiveKitController()

	try {
		const rooms = await controller.listRooms()
		return NextResponse.json({ rooms })
	} catch (err) {
		if (err instanceof Error) {
			return new NextResponse(err.message, { status: 500 })
		}
		return new NextResponse(null, { status: 500 })
	}
}