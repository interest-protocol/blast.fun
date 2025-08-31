"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { HostStream } from "../_components/host-stream"

export default function HostPage() {
	const searchParams = useSearchParams()
	const router = useRouter()
	const roomName = searchParams.get("room")
	const [token, setToken] = useState<string>("")
	const [loading, setLoading] = useState(true)

	useEffect(() => {
		if (!roomName) {
			router.push("/stream")
			return
		}

		// @dev: Get the stored token from session storage
		const storedToken = sessionStorage.getItem("stream_token")
		const storedConnection = sessionStorage.getItem("stream_connection")
		
		if (storedToken && storedConnection) {
			const connection = JSON.parse(storedConnection)
			setToken(connection.token)
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

	if (!token) {
		return (
			<div className="flex items-center justify-center min-h-screen">
				<p className="text-muted-foreground">Failed to setup stream</p>
			</div>
		)
	}

	return (
		<div className="container mx-auto py-4">
			<HostStream token={token} roomName={roomName!} />
		</div>
	)
}