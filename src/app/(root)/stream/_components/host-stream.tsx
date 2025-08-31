"use client"

import {
	LiveKitRoom,
	GridLayout,
	ParticipantTile,
	RoomAudioRenderer,
	useTracks,
	useRoomContext,
	useChat,
	useLocalParticipant,
	useParticipants,
} from "@livekit/components-react"
import { Track, RoomEvent } from "livekit-client"
import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
	MessageSquare, 
	Users, 
	Radio, 
	WifiOff, 
	Copy, 
	Check, 
	Mic, 
	MicOff, 
	Video, 
	VideoOff, 
	Monitor,
	Send,
	Hand,
	UserPlus,
	MoreVertical,
	Settings,
} from "lucide-react"
import { env } from "@/env"
import { useRouter } from "next/navigation"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface HostStreamProps {
	token: string
	roomName: string
}

export function HostStream({ token, roomName }: HostStreamProps) {
	const [isLive, setIsLive] = useState(false)
	const [copied, setCopied] = useState(false)
	const [sidebarOpen, setSidebarOpen] = useState(true)
	const router = useRouter()

	const handleEndStream = async () => {
		// @dev: Clean up session storage
		sessionStorage.removeItem("stream_token")
		sessionStorage.removeItem("stream_connection")
		router.push("/stream")
	}

	const copyStreamLink = () => {
		const link = `${window.location.origin}/stream/room/${roomName}`
		navigator.clipboard.writeText(link)
		setCopied(true)
		setTimeout(() => setCopied(false), 2000)
	}

	return (
		<LiveKitRoom
			video={true}
			audio={true}
			token={token}
			serverUrl={env.NEXT_PUBLIC_LIVEKIT_WS_URL}
			onConnected={() => setIsLive(true)}
			onDisconnected={handleEndStream}
			data-lk-theme="default"
		>
			<div className="h-screen flex flex-col bg-background">
				{/* @dev: Header */}
				<div className="border-b">
					<div className="flex items-center justify-between px-4 py-3">
						<div className="flex items-center gap-4">
							<div className="flex items-center gap-2">
								{isLive ? (
									<>
										<div className="flex items-center gap-2 px-3 py-1 bg-red-500/10 rounded-full">
											<Radio className="w-4 h-4 text-red-500 animate-pulse" />
											<span className="text-sm font-semibold text-red-500">LIVE</span>
										</div>
									</>
								) : (
									<>
										<div className="flex items-center gap-2 px-3 py-1 bg-muted rounded-full">
											<WifiOff className="w-4 h-4 text-muted-foreground" />
											<span className="text-sm text-muted-foreground">Connecting...</span>
										</div>
									</>
								)}
							</div>
							<div className="text-sm text-muted-foreground">
								Room: <span className="font-mono font-medium">{roomName}</span>
							</div>
							<ViewerCount />
						</div>
						<div className="flex items-center gap-2">
							<Button
								variant="outline"
								size="sm"
								onClick={copyStreamLink}
							>
								{copied ? (
									<Check className="w-4 h-4 mr-2" />
								) : (
									<Copy className="w-4 h-4 mr-2" />
								)}
								{copied ? "Copied!" : "Share Link"}
							</Button>
							<Button
								variant="ghost"
								size="sm"
								onClick={() => setSidebarOpen(!sidebarOpen)}
							>
								<MessageSquare className="w-4 h-4 mr-2" />
								{sidebarOpen ? "Hide" : "Show"} Panel
							</Button>
							<Button
								variant="destructive"
								size="sm"
								onClick={handleEndStream}
							>
								End Stream
							</Button>
						</div>
					</div>
				</div>

				{/* @dev: Main content */}
				<div className="flex-1 flex overflow-hidden">
					{/* @dev: Video area */}
					<div className="flex-1 relative bg-black">
						<VideoArea />
						<MediaControls />
					</div>

					{/* @dev: Sidebar */}
					{sidebarOpen && (
						<div className="w-96 border-l bg-background">
							<Tabs defaultValue="chat" className="h-full flex flex-col">
								<TabsList className="grid w-full grid-cols-2 rounded-none">
									<TabsTrigger value="chat">
										<MessageSquare className="w-4 h-4 mr-2" />
										Chat
									</TabsTrigger>
									<TabsTrigger value="participants">
										<Users className="w-4 h-4 mr-2" />
										Participants
									</TabsTrigger>
								</TabsList>
								<TabsContent value="chat" className="flex-1 flex flex-col m-0">
									<ChatSection />
								</TabsContent>
								<TabsContent value="participants" className="flex-1 m-0">
									<ParticipantsSection />
								</TabsContent>
							</Tabs>
						</div>
					)}
				</div>
			</div>
			
			<RoomAudioRenderer />
		</LiveKitRoom>
	)
}

function VideoArea() {
	const tracks = useTracks(
		[
			{ source: Track.Source.Camera, withPlaceholder: true },
			{ source: Track.Source.ScreenShare, withPlaceholder: false },
		],
		{ onlySubscribed: false }
	)

	return (
		<GridLayout tracks={tracks} style={{ height: "100%", width: "100%", padding: "1rem" }}>
			<ParticipantTile />
		</GridLayout>
	)
}

function MediaControls() {
	const room = useRoomContext()
	const localParticipant = useLocalParticipant()
	
	const [isMuted, setIsMuted] = useState(false)
	const [isVideoOff, setIsVideoOff] = useState(false)
	const [isScreenSharing, setIsScreenSharing] = useState(false)

	useEffect(() => {
		if (localParticipant.localParticipant) {
			setIsMuted(!localParticipant.localParticipant.isMicrophoneEnabled)
			setIsVideoOff(!localParticipant.localParticipant.isCameraEnabled)
			setIsScreenSharing(localParticipant.localParticipant.isScreenShareEnabled)
		}
	}, [localParticipant])

	const toggleMicrophone = async () => {
		if (!room) return
		const enabled = room.localParticipant.isMicrophoneEnabled
		await room.localParticipant.setMicrophoneEnabled(!enabled)
		setIsMuted(enabled)
	}

	const toggleCamera = async () => {
		if (!room) return
		const enabled = room.localParticipant.isCameraEnabled
		await room.localParticipant.setCameraEnabled(!enabled)
		setIsVideoOff(enabled)
	}

	const toggleScreenShare = async () => {
		if (!room) return
		const enabled = room.localParticipant.isScreenShareEnabled
		await room.localParticipant.setScreenShareEnabled(!enabled)
		setIsScreenSharing(!enabled)
	}

	return (
		<div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-10">
			<div className="flex items-center gap-2 bg-background/95 backdrop-blur-sm rounded-full p-2 shadow-lg border">
				<Button
					size="icon"
					variant={isMuted ? "destructive" : "secondary"}
					onClick={toggleMicrophone}
					className="rounded-full"
				>
					{isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
				</Button>
				<Button
					size="icon"
					variant={isVideoOff ? "destructive" : "secondary"}
					onClick={toggleCamera}
					className="rounded-full"
				>
					{isVideoOff ? <VideoOff className="w-4 h-4" /> : <Video className="w-4 h-4" />}
				</Button>
				<Button
					size="icon"
					variant={isScreenSharing ? "default" : "secondary"}
					onClick={toggleScreenShare}
					className="rounded-full"
				>
					<Monitor className="w-4 h-4" />
				</Button>
				<div className="w-px h-8 bg-border mx-1" />
				<Button
					size="icon"
					variant="secondary"
					className="rounded-full"
				>
					<Settings className="w-4 h-4" />
				</Button>
			</div>
		</div>
	)
}

function ChatSection() {
	const { send, chatMessages } = useChat()
	const [message, setMessage] = useState("")
	const scrollRef = useRef<HTMLDivElement>(null)

	useEffect(() => {
		if (scrollRef.current) {
			scrollRef.current.scrollTop = scrollRef.current.scrollHeight
		}
	}, [chatMessages])

	const handleSend = () => {
		if (message.trim()) {
			send(message)
			setMessage("")
		}
	}

	return (
		<>
			<ScrollArea className="flex-1 p-4" ref={scrollRef}>
				<div className="space-y-4">
					{chatMessages.map((msg, idx) => (
						<div key={idx} className="flex gap-3">
							<Avatar className="h-8 w-8">
								<AvatarFallback className="text-xs">
									{msg.from?.name?.[0] || "U"}
								</AvatarFallback>
							</Avatar>
							<div className="flex-1">
								<div className="flex items-center gap-2">
									<span className="text-sm font-medium">
										{msg.from?.name || "Anonymous"}
									</span>
									<span className="text-xs text-muted-foreground">
										{new Date(msg.timestamp).toLocaleTimeString()}
									</span>
								</div>
								<p className="text-sm mt-1">{msg.message}</p>
							</div>
						</div>
					))}
				</div>
			</ScrollArea>
			<div className="p-4 border-t">
				<div className="flex gap-2">
					<Input
						placeholder="Type a message..."
						value={message}
						onChange={(e) => setMessage(e.target.value)}
						onKeyPress={(e) => e.key === "Enter" && handleSend()}
						className="flex-1"
					/>
					<Button size="icon" onClick={handleSend}>
						<Send className="w-4 h-4" />
					</Button>
				</div>
			</div>
		</>
	)
}

function ParticipantsSection() {
	const participants = useParticipants()
	const room = useRoomContext()

	const handleInviteToStage = async (identity: string) => {
		// @dev: This would call the API to invite participant to stage
		console.log("Inviting to stage:", identity)
	}

	return (
		<ScrollArea className="h-full">
			<div className="p-4 space-y-2">
				{participants.map((participant) => (
					<div
						key={participant.identity}
						className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors"
					>
						<div className="flex items-center gap-3">
							<Avatar className="h-8 w-8">
								<AvatarFallback className="text-xs">
									{participant.name?.[0] || "U"}
								</AvatarFallback>
							</Avatar>
							<div>
								<div className="flex items-center gap-2">
									<span className="text-sm font-medium">
										{participant.name || participant.identity}
									</span>
									{participant.isLocal && (
										<span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">
											You
										</span>
									)}
								</div>
								<div className="flex items-center gap-2 mt-1">
									{participant.isMicrophoneEnabled && (
										<Mic className="w-3 h-3 text-muted-foreground" />
									)}
									{participant.isCameraEnabled && (
										<Video className="w-3 h-3 text-muted-foreground" />
									)}
								</div>
							</div>
						</div>
						{!participant.isLocal && (
							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<Button variant="ghost" size="icon" className="h-8 w-8">
										<MoreVertical className="w-4 h-4" />
									</Button>
								</DropdownMenuTrigger>
								<DropdownMenuContent align="end">
									<DropdownMenuItem onClick={() => handleInviteToStage(participant.identity)}>
										<UserPlus className="w-4 h-4 mr-2" />
										Invite to stage
									</DropdownMenuItem>
								</DropdownMenuContent>
							</DropdownMenu>
						)}
					</div>
				))}
			</div>
		</ScrollArea>
	)
}

function ViewerCount() {
	const room = useRoomContext()
	const [count, setCount] = useState(0)

	useEffect(() => {
		if (room) {
			setCount(room.remoteParticipants.size)
			
			const handleParticipantConnected = () => {
				setCount(room.remoteParticipants.size)
			}
			
			const handleParticipantDisconnected = () => {
				setCount(room.remoteParticipants.size)
			}

			room.on(RoomEvent.ParticipantConnected, handleParticipantConnected)
			room.on(RoomEvent.ParticipantDisconnected, handleParticipantDisconnected)

			return () => {
				room.off(RoomEvent.ParticipantConnected, handleParticipantConnected)
				room.off(RoomEvent.ParticipantDisconnected, handleParticipantDisconnected)
			}
		}
	}, [room])

	return (
		<div className="flex items-center gap-2 text-sm">
			<Users className="w-4 h-4" />
			<span className="font-medium">{count}</span>
			<span className="text-muted-foreground">viewers</span>
		</div>
	)
}