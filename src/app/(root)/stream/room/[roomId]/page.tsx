import { auth } from "@/auth"
import { StreamPlayerClient } from "../../_components/stream-player-client"

export default async function RoomPage({
	params,
}: {
	params: { roomId: string }
}) {
	const session = await auth()
	const roomName = params.roomId

	return <StreamPlayerClient roomName={roomName} session={session} />
}