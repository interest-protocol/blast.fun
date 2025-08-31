"use client"

import { useEffect, useState, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { LiveKitRoom } from "@livekit/components-react"
import { env } from "@/env"
import { StreamView } from "../_components/stream-view"
import { TokenContext } from "../_components/token-context"
import { useSession } from "next-auth/react"

function HostContent() {
	const searchParams = useSearchParams()
	const router = useRouter()
	const roomName = searchParams.get("room")
	const [authToken, setAuthToken] = useState<string>("")
	const [roomToken, setRoomToken] = useState<string>("")
	const [loading, setLoading] = useState(true)
	const { data: session } = useSession()

	useEffect(() => {
		if (!roomName) {
			router.push("/stream")
			return
		}

		// @dev: Get the stored tokens from session storage
		const storedAuthToken = sessionStorage.getItem("stream_token")
		const storedConnection = sessionStorage.getItem("stream_connection")
		
		if (storedAuthToken && storedConnection) {
			const connection = JSON.parse(storedConnection)
			setAuthToken(storedAuthToken)
			setRoomToken(connection.token)
			setLoading(false)
		} else {
			router.push("/stream")
		}
	}, [roomName, router])

	if (loading) {
		return (
			<div className="flex items-center justify-center min-h-screen">
				<p className="text-muted-foreground">Setting up stream...</p>
			</div>
		)
	}

	if (!roomToken) {
		return (
			<div className="flex items-center justify-center min-h-screen">
				<p className="text-muted-foreground">Failed to setup stream</p>
			</div>
		)
	}

	// @dev: Use the same StreamView component as viewers for consistent UI
	return (
		<TokenContext.Provider value={authToken}>
			<LiveKitRoom 
				serverUrl={env.NEXT_PUBLIC_LIVEKIT_WS_URL} 
				token={roomToken}
				audio={true}
				video={true}
			>
				<StreamView roomName={roomName!} session={session} isHost={true} />
			</LiveKitRoom>
		</TokenContext.Provider>
	)
}

export default function HostPage() {
	return (
		<Suspense fallback={
			<div className="flex items-center justify-center min-h-screen">
				<p className="text-muted-foreground">Setting up stream...</p>
			</div>
		}>
			<HostContent />
		</Suspense>
	)
}