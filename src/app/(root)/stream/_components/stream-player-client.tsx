"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ArrowRight, User, Loader2 } from "lucide-react"
import { LiveKitRoom } from "@livekit/components-react"
import { env } from "@/env"
import { StreamView } from "./stream-view"
import { TokenContext } from "./token-context"

interface StreamPlayerClientProps {
	roomName: string
	session: any
}

export function StreamPlayerClient({ roomName, session }: StreamPlayerClientProps) {
	const [name, setName] = useState(session?.user?.name || "")
	const [authToken, setAuthToken] = useState("")
	const [roomToken, setRoomToken] = useState("")
	const [loading, setLoading] = useState(false)

	const onJoin = async () => {
		setLoading(true)
		try {
			// @dev: Use authenticated user info or custom name
			const identity = session?.user?.username || name || `viewer-${Math.floor(Math.random() * 10000)}`
			
			const res = await fetch("/api/stream/join", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					room_name: roomName,
					identity: identity,
				}),
			})
			
			const data = await res.json()
			setAuthToken(data.auth_token)
			setRoomToken(data.connection_details.token)
		} catch (error) {
			console.error("Failed to join:", error)
		} finally {
			setLoading(false)
		}
	}

	// @dev: Show join form if not authenticated or no token
	if (!authToken || !roomToken) {
		return (
			<div className="min-h-screen flex items-center justify-center p-4">
				<Card className="w-full max-w-md p-6">
					<div className="space-y-6">
						<div>
							<h2 className="text-2xl font-bold">Entering {decodeURI(roomName)}</h2>
							<p className="text-muted-foreground mt-2">
								Join the livestream as a viewer
							</p>
						</div>
						
						<div className="space-y-2">
							<label className="text-sm font-medium">Your name</label>
							<div className="relative">
								<div className="absolute left-3 top-1/2 -translate-y-1/2">
									{session?.user?.image ? (
										<Avatar className="h-6 w-6">
											<AvatarImage src={session.user.image} />
											<AvatarFallback>
												{session.user.name?.[0] || <User className="w-4 h-4" />}
											</AvatarFallback>
										</Avatar>
									) : (
										<Avatar className="h-6 w-6">
											<AvatarFallback>
												{name?.[0] || <User className="w-4 h-4" />}
											</AvatarFallback>
										</Avatar>
									)}
								</div>
								<Input
									className="pl-12"
									placeholder={session?.user?.name || "Enter your name"}
									type="text"
									value={name}
									onChange={(e) => setName(e.target.value)}
									disabled={loading || !!session?.user?.name}
								/>
							</div>
							{session?.user?.username && (
								<p className="text-xs text-muted-foreground">
									Joining as @{session.user.username}
								</p>
							)}
						</div>
						
						<Button 
							className="w-full" 
							disabled={(!name && !session?.user?.name) || loading}
							onClick={onJoin}
						>
							{loading ? (
								<>
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									Joining...
								</>
							) : (
								<>
									Join as viewer
									<ArrowRight className={`ml-2 h-4 w-4 ${(name || session?.user?.name) ? "animate-pulse" : ""}`} />
								</>
							)}
						</Button>
					</div>
				</Card>
			</div>
		)
	}

	return (
		<TokenContext.Provider value={authToken}>
			<LiveKitRoom 
				serverUrl={env.NEXT_PUBLIC_LIVEKIT_WS_URL} 
				token={roomToken}
				audio={false}
				video={false}
			>
				<StreamView roomName={roomName} session={session} />
			</LiveKitRoom>
		</TokenContext.Provider>
	)
}