import { NextRequest } from "next/server"
import { auth } from "@/auth"
import { LiveKitController } from "@/lib/livekit-controller"

const livekitController = new LiveKitController()

export async function POST(req: NextRequest) {
	try {
		const session = await auth()
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
		
		// @dev: Get room name from token or session
		const roomName = token.split("-")[0] // Token format: roomName-timestamp
		
		// @dev: Update participant metadata to indicate hand raised
		await livekitController.updateParticipantMetadata(roomName, identity, {
			hand_raised: true,
			image: session?.user?.image || null,
			username: session?.user?.username || null,
		})
		
		return Response.json({ success: true })
	} catch (error) {
		console.error("Raise hand error:", error)
		return Response.json(
			{ error: "Failed to raise hand" },
			{ status: 500 }
		)
	}
}