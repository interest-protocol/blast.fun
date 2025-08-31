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
		
		const { identity } = await req.json()
		
		if (!identity) {
			return Response.json({ error: "Identity required" }, { status: 400 })
		}
		
		// @dev: Get room name from token
		const roomName = token.split("-")[0]
		
		// @dev: Update participant metadata to remove from stage
		await livekitController.updateParticipantMetadata(roomName, identity, {
			invited_to_stage: false,
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