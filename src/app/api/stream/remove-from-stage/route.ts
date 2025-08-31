import { NextRequest } from "next/server"
import { LiveKitController } from "@/lib/livekit-controller"

const livekitController = new LiveKitController()

export async function POST(req: NextRequest) {
	try {
		const authHeader = req.headers.get("authorization")
		const token = authHeader?.replace("Bearer ", "")
		
		// @dev: Validate auth token
		if (!token) {
			return Response.json({ error: "Unauthorized" }, { status: 401 })
		}
		
		const { identity, roomName } = await req.json()
		
		if (!identity || !roomName) {
			return Response.json({ error: "Identity and room name required" }, { status: 400 })
		}
		
		// @dev: Update participant metadata to remove from stage
		await livekitController.updateParticipantMetadata(roomName, identity, {
			invited_to_stage: false,
			accepted_invite: false,
			hand_raised: false,
		})
		
		// @dev: Revoke permission to publish
		await livekitController.updateParticipantPermissions(roomName, identity, {
			canPublish: false,
			canPublishData: true, // Keep data channel for chat
			canSubscribe: true,
		})
		
		return Response.json({ success: true })
	} catch (error) {
		console.error("Remove from stage error:", error)
		return Response.json(
			{ error: "Failed to remove from stage" },
			{ status: 500 }
		)
	}
}