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
		
		// @dev: Mark invitation as accepted
		await livekitController.updateParticipantMetadata(
			roomName,
			identity,
			{
				accepted_invite: true,
			}
		)
		
		// @dev: Grant permission to publish tracks
		await livekitController.updateParticipantPermissions(
			roomName,
			identity,
			{
				canPublish: true,
				canPublishData: true,
				canSubscribe: true,
			}
		)
		
		return NextResponse.json({ success: true })
	} catch (error) {
		console.error("Error accepting invitation:", error)
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		)
	}
}