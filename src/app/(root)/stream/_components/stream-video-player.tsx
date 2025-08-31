"use client"

import {
	AudioTrack,
	StartAudio,
	VideoTrack,
	useDataChannel,
	useLocalParticipant,
	useMediaDeviceSelect,
	useParticipants,
	useRoomContext,
	useTracks,
} from "@livekit/components-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Copy, Eye } from "lucide-react"
import { ConnectionState, LocalVideoTrack, Track, createLocalTracks } from "livekit-client"
import { useEffect, useRef, useState } from "react"
import { PresenceDialog } from "./presence-dialog"
import { useAuthToken } from "./token-context"
import { cn } from "@/utils"
import JSConfetti from "js-confetti"

interface StreamVideoPlayerProps {
	session: any
	isHost?: boolean
}

export function StreamVideoPlayer({ session, isHost = false }: StreamVideoPlayerProps) {
	const [localVideoTrack, setLocalVideoTrack] = useState<LocalVideoTrack>()
	const localVideoEl = useRef<HTMLVideoElement>(null)
	const [copied, setCopied] = useState(false)
	
	const { metadata, name: roomName, state: roomState } = useRoomContext()
	const roomMetadata = metadata ? JSON.parse(metadata) : {}
	const { localParticipant } = useLocalParticipant()
	const localMetadata = localParticipant.metadata ? JSON.parse(localParticipant.metadata) : {}
	
	const canHost = isHost || (localMetadata?.invited_to_stage && localMetadata?.hand_raised)
	const participants = useParticipants()
	
	const showNotification = isHost
		? participants.some((p) => {
			const metadata = p.metadata ? JSON.parse(p.metadata) : {}
			return metadata?.hand_raised && !metadata?.invited_to_stage
		})
		: localMetadata?.invited_to_stage && !localMetadata?.hand_raised

	// @dev: Setup local video for hosts
	useEffect(() => {
		if (canHost) {
			const createTracks = async () => {
				const tracks = await createLocalTracks({ audio: true, video: true })
				const camTrack = tracks.find((t) => t.kind === Track.Kind.Video)
				if (camTrack && localVideoEl?.current) {
					camTrack.attach(localVideoEl.current)
				}
				setLocalVideoTrack(camTrack as LocalVideoTrack)
			}
			void createTracks()
		}
	}, [canHost])

	const { activeDeviceId: activeCameraDeviceId } = useMediaDeviceSelect({
		kind: "videoinput",
	})

	useEffect(() => {
		if (localVideoTrack) {
			void localVideoTrack.setDeviceId(activeCameraDeviceId)
		}
	}, [localVideoTrack, activeCameraDeviceId])

	const remoteVideoTracks = useTracks([Track.Source.Camera]).filter(
		(t) => t.participant.identity !== localParticipant.identity
	)

	const remoteAudioTracks = useTracks([Track.Source.Microphone]).filter(
		(t) => t.participant.identity !== localParticipant.identity
	)

	const authToken = useAuthToken()
	
	const onLeaveStage = async () => {
		await fetch("/api/stream/remove-from-stage", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${authToken}`,
			},
			body: JSON.stringify({
				identity: localParticipant.identity,
			}),
		})
	}

	const copyLink = () => {
		const link = `${window.location.origin}/stream/room/${roomName}`
		navigator.clipboard.writeText(link)
		setCopied(true)
		setTimeout(() => setCopied(false), 2000)
	}

	return (
		<div className="relative h-full w-full bg-black">
			<div className={cn(
				"absolute inset-0 flex items-center justify-center p-4",
				canHost && remoteVideoTracks.length === 0 && "w-full",
				canHost && remoteVideoTracks.length > 0 && "grid grid-cols-2 gap-2",
				!canHost && remoteVideoTracks.length === 1 && "w-full",
				!canHost && remoteVideoTracks.length > 1 && "grid grid-cols-2 gap-2"
			)}>
				{canHost && (
					<div className="relative w-full h-full max-w-[800px] max-h-[600px] mx-auto">
						<video
							ref={localVideoEl}
							className="w-full h-full object-contain scale-x-[-1]"
						/>
						<div className="absolute bottom-2 left-2">
							<Badge variant="secondary" className="bg-background/80 text-xs">
								{localParticipant.identity} (you)
							</Badge>
						</div>
					</div>
				)}
				
				{remoteVideoTracks.map((t) => (
					<div key={t.participant.identity} className="relative w-full h-full max-w-[800px] max-h-[600px] mx-auto">
						<VideoTrack
							trackRef={t}
							className="w-full h-full object-contain"
						/>
						<div className="absolute bottom-2 left-2">
							<Badge variant="secondary" className="bg-background/80 text-xs">
								{t.participant.identity}
							</Badge>
						</div>
					</div>
				))}
			</div>
			
			{remoteAudioTracks.map((t) => (
				<AudioTrack trackRef={t} key={t.participant.identity} />
			))}
			
			<ConfettiCanvas />
			
			<StartAudio
				label="Click to allow audio playback"
				className="absolute top-0 h-full w-full bg-black/50 text-white backdrop-blur-sm"
			/>
			
			{/* @dev: Top controls */}
			<div className="absolute top-0 w-full p-4">
				<div className="flex justify-between items-center">
					<div className="flex gap-2 items-center">
						<Button
							size="sm"
							variant="secondary"
							disabled={!roomName}
							onClick={copyLink}
							className="bg-background/80 backdrop-blur-sm"
						>
							{copied ? "Copied!" : roomName || "Loading..."}
							<Copy className="ml-2 h-3 w-3" />
						</Button>
						
						{roomName && canHost && roomMetadata?.creator_identity !== localParticipant.identity && (
							<Button 
								size="sm" 
								onClick={onLeaveStage}
								className="bg-background/80 backdrop-blur-sm"
							>
								Leave stage
							</Button>
						)}
					</div>
					
					<div className="flex gap-2 items-center">
						{roomState === ConnectionState.Connected && (
							<div className="flex gap-2 items-center px-3 py-1 bg-red-500/20 rounded-full backdrop-blur-sm">
								<div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
								<span className="text-xs uppercase text-red-500 font-medium">Live</span>
							</div>
						)}
						
						<PresenceDialog isHost={isHost}>
							<div className="relative">
								{showNotification && (
									<div className="absolute -top-1 -right-1 flex h-3 w-3">
										<span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75" />
										<span className="relative inline-flex rounded-full h-3 w-3 bg-red-500" />
									</div>
								)}
								<Button
									size="sm"
									variant="secondary"
									disabled={roomState !== ConnectionState.Connected}
									className="bg-background/80 backdrop-blur-sm"
								>
									<Eye className="h-4 w-4 mr-2" />
									{roomState === ConnectionState.Connected ? participants.length : "0"}
								</Button>
							</div>
						</PresenceDialog>
					</div>
				</div>
			</div>
		</div>
	)
}

function ConfettiCanvas() {
	const [confetti, setConfetti] = useState<JSConfetti>()
	const [decoder] = useState(() => new TextDecoder())
	const canvasEl = useRef<HTMLCanvasElement>(null)
	
	useDataChannel("reactions", (data) => {
		const options: { emojis?: string[]; confettiNumber?: number } = {}
		
		if (decoder.decode(data.payload) !== "🎉") {
			options.emojis = [decoder.decode(data.payload)]
			options.confettiNumber = 12
		}
		
		confetti?.addConfetti(options)
	})

	useEffect(() => {
		if (canvasEl.current) {
			setConfetti(new JSConfetti({ canvas: canvasEl.current }))
		}
	}, [])

	return <canvas ref={canvasEl} className="absolute h-full w-full pointer-events-none" />
}