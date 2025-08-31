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
		
		// @dev: Update participant metadata to invite to stage
		await livekitController.updateParticipantMetadata(roomName, identity, {
			invited_to_stage: true,
			hand_raised: true, // Keep hand_raised true to indicate on stage
		})
		
		// @dev: Grant permission to publish
		await livekitController.updateParticipantPermissions(roomName, identity, {
			canPublish: true,
			canPublishData: true,
			canSubscribe: true,
		})
		
		return Response.json({ success: true })
	} catch (error) {
		console.error("Invite to stage error:", error)
		return Response.json(
			{ error: "Failed to invite to stage" },
			{ status: 500 }
		)
	}
}