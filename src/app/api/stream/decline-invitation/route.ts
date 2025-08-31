import { NextRequest, NextResponse } from "next/server"
import { LiveKitController } from "@/lib/livekit-controller"

const livekitController = new LiveKitController()

export async function POST(request: NextRequest) {
	try {
		const { identity, roomName } = await request.json()
		
		if (!identity || !roomName) {
			return NextResponse.json(
				{ error: "Missing identity or roomName" },
				{ status: 400 }
			)
		}
		
		// @dev: Clear invitation and hand raise
		await livekitController.updateParticipantMetadata(
			roomName,
			identity,
			{
				invited_to_stage: false,
				accepted_invite: false,
				hand_raised: false,
			}
		)
		
		return NextResponse.json({ success: true })
	} catch (error) {
		console.error("Error declining invitation:", error)
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		)
	}
}