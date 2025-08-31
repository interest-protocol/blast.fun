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
import { Copy, Eye, Monitor, MonitorOff, Pin, PinOff, Mic, MicOff } from "lucide-react"
import { ConnectionState, LocalVideoTrack, Track, createLocalTracks, createLocalScreenTracks } from "livekit-client"
import { useEffect, useRef, useState } from "react"
import { PresenceDialog } from "./presence-dialog"
import { MediaDeviceSelector } from "./media-device-selector"
import { HostMediaControls } from "./host-media-controls"
import { useAuthToken } from "./token-context"
import { cn } from "@/utils"
import JSConfetti from "js-confetti"

interface StreamVideoPlayerProps {
	session: any
	isHost?: boolean
}

// @dev: Component to render individual video feeds with pin controls
function RenderVideoFeed({ 
	feed, 
	isPinned, 
	onPin, 
	localVideoEl,
	isLocal
}: {
	feed: any
	isPinned: boolean
	onPin: () => void
	localVideoEl: React.RefObject<HTMLVideoElement | null>
	isLocal: boolean
}) {
	const isScreenShare = feed.type.includes('screen')
	const isLocalCamera = feed.type === 'local-camera'
	
	// @dev: Check if microphone is muted or unpublished
	const isMicMuted = (() => {
		// @dev: Check audio track publications for this participant
		const audioPublication = Array.from(feed.participant.audioTrackPublications.values())
			.find((pub: any) => pub.source === Track.Source.Microphone)
		
		// @dev: Consider mic muted if no publication, no track, or track is muted
		if (!audioPublication || !(audioPublication as any).track) {
			return true // No mic track = muted
		}
		
		return (audioPublication as any).isMuted
	})()
	
	return (
		<div className="relative w-full h-full bg-gray-900 rounded-lg overflow-hidden group">
			{/* @dev: Render video based on type */}
			{isLocalCamera && feed.track ? (
				<video
					ref={localVideoEl}
					className="w-full h-full object-contain scale-x-[-1]"
				/>
			) : feed.type === 'local-screen' && feed.track ? (
				<VideoTrack
					trackRef={{ 
						participant: feed.participant, 
						publication: feed.participant.trackPublications.get(Track.Source.ScreenShare)!, 
						source: Track.Source.ScreenShare 
					}}
					className="w-full h-full object-contain"
				/>
			) : feed.trackRef ? (
				<VideoTrack
					trackRef={feed.trackRef}
					className="w-full h-full object-contain"
				/>
			) : (
				// @dev: Placeholder for no video
				<div className="w-full h-full flex items-center justify-center">
					<div className="text-center">
						<div className="w-16 h-16 mx-auto mb-2 rounded-full bg-gray-800 flex items-center justify-center">
							<span className="text-2xl font-bold text-gray-600">
								{feed.participant.identity?.charAt(0)?.toUpperCase() || "?"}
							</span>
						</div>
						<p className="text-gray-500 text-xs">Camera Off</p>
					</div>
				</div>
			)}
			
			{/* @dev: Identity badges */}
			<div className="absolute bottom-2 left-2 flex gap-2 items-center">
				<Badge variant="secondary" className="bg-background/80 text-xs flex items-center gap-1">
					{feed.participant.identity} {isLocal && "(you)"}
					{/* @dev: Mic status indicator */}
					{!isScreenShare && (
						isMicMuted ? (
							<MicOff className="h-3 w-3 text-red-500" />
						) : (
							<Mic className="h-3 w-3 text-green-500" />
						)
					)}
				</Badge>
				{isScreenShare && (
					<Badge variant="destructive" className="text-xs">
						Screen Share
					</Badge>
				)}
			</div>
			
			{/* @dev: Pin button at bottom right */}
			<Button
				size="icon"
				variant="ghost"
				onClick={onPin}
				className="absolute bottom-2 right-2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 hover:bg-black/70"
			>
				{isPinned ? <PinOff className="h-4 w-4" /> : <Pin className="h-4 w-4" />}
			</Button>
		</div>
	)
}

export function StreamVideoPlayer({ session, isHost = false }: StreamVideoPlayerProps) {
	const [localVideoTrack, setLocalVideoTrack] = useState<LocalVideoTrack>()
	const [screenShareTrack, setScreenShareTrack] = useState<LocalVideoTrack>()
	const [isScreenSharing, setIsScreenSharing] = useState(false)
	const localVideoEl = useRef<HTMLVideoElement>(null)
	const screenShareEl = useRef<HTMLVideoElement>(null)
	const [copied, setCopied] = useState(false)
	const [pinnedVideoId, setPinnedVideoId] = useState<string | null>(null)
	
	const { metadata, name: roomName, state: roomState } = useRoomContext()
	const roomMetadata = metadata ? JSON.parse(metadata) : {}
	const { localParticipant } = useLocalParticipant()
	const localMetadata = localParticipant.metadata ? JSON.parse(localParticipant.metadata) : {}
	
	console.log("StreamVideoPlayer initial state:", {
		identity: localParticipant.identity,
		isHost,
		localMetadata,
		hasMetadata: !!localParticipant.metadata
	})
	
	// @dev: Check if user is invited participant who accepted
	const isInvitedParticipant = !isHost && localMetadata?.invited_to_stage && localMetadata?.accepted_invite
	// @dev: User can publish if they're the room host OR if they've accepted invitation
	// @dev: IMPORTANT: For viewers, ensure metadata is loaded before allowing publish
	const canPublish = isHost || (localParticipant.metadata && isInvitedParticipant)
	const hasInvitation = localMetadata?.invited_to_stage && !localMetadata?.accepted_invite
	const participants = useParticipants()
	
	const showNotification = isHost && participants.some((p) => {
		const metadata = p.metadata ? JSON.parse(p.metadata) : {}
		return metadata?.hand_raised && !metadata?.invited_to_stage
	})

	// @dev: Setup local video ONLY for hosts and ACCEPTED participants
	useEffect(() => {
		// @dev: CRITICAL: Never create tracks for viewers unless explicitly invited and accepted
		if (!isHost) {
			// @dev: For viewers, only proceed if they have been invited AND accepted
			if (!localMetadata?.invited_to_stage || !localMetadata?.accepted_invite) {
				console.log("Viewer without accepted invitation - skipping track creation:", {
					identity: localParticipant.identity,
					invited: localMetadata?.invited_to_stage,
					accepted: localMetadata?.accepted_invite
				})
				return
			}
		}
		
		// @dev: Double-check we should create tracks
		const shouldCreateTracks = isHost || (localMetadata?.invited_to_stage && localMetadata?.accepted_invite)
		
		console.log("Track creation check:", {
			identity: localParticipant.identity,
			isHost,
			shouldCreateTracks,
			canPublish,
			isScreenSharing,
			metadata: localMetadata
		})
		
		if (shouldCreateTracks && canPublish && !isScreenSharing) {
			const createTracks = async () => {
				console.log("Creating tracks for:", localParticipant.identity, { isHost, metadata: localMetadata })
				const tracks = await createLocalTracks({ audio: true, video: true })
				const camTrack = tracks.find((t) => t.kind === Track.Kind.Video) as LocalVideoTrack
				const audioTrack = tracks.find((t) => t.kind === Track.Kind.Audio)
				
				if (camTrack) {
					if (localVideoEl?.current) {
						camTrack.attach(localVideoEl.current)
					}
					setLocalVideoTrack(camTrack)
					// @dev: Publish the video track
					await localParticipant.publishTrack(camTrack)
				}
				
				if (audioTrack) {
					// @dev: Publish the audio track
					await localParticipant.publishTrack(audioTrack)
				}
			}
			void createTracks()
		}
		
		return () => {
			// @dev: Cleanup tracks when component unmounts or canPublish changes
			if (localVideoTrack && !canPublish) {
				localVideoTrack.stop()
				setLocalVideoTrack(undefined)
			}
		}
	}, [canPublish, isScreenSharing, localParticipant, isHost, localMetadata?.invited_to_stage, localMetadata?.accepted_invite])
	
	// @dev: Listen for camera enable/disable events
	useEffect(() => {
		const checkCameraState = () => {
			const cameraPublication = Array.from(localParticipant.videoTrackPublications.values())
				.find(pub => pub.source === Track.Source.Camera)
			
			if (cameraPublication && cameraPublication.track) {
				const track = cameraPublication.track as LocalVideoTrack
				
				if (cameraPublication.isMuted) {
					// @dev: Camera is muted/disabled
					if (localVideoTrack && localVideoEl.current) {
						track.detach(localVideoEl.current)
					}
					setLocalVideoTrack(undefined)
				} else {
					// @dev: Camera is enabled
					if (!localVideoTrack || localVideoTrack !== track) {
						// @dev: Attach the track if not already attached
						if (localVideoEl.current) {
							// @dev: Detach any existing track first
							if (localVideoTrack && localVideoTrack !== track) {
								localVideoTrack.detach(localVideoEl.current)
							}
							// @dev: Attach the new/current track
							track.attach(localVideoEl.current)
						}
						setLocalVideoTrack(track)
					}
				}
			} else {
				// @dev: No camera track - it's been unpublished
				if (localVideoTrack && localVideoEl.current) {
					localVideoTrack.detach(localVideoEl.current)
				}
				setLocalVideoTrack(undefined)
			}
		}
		
		// @dev: Check state periodically
		checkCameraState() // Check immediately
		const interval = setInterval(checkCameraState, 500)
		return () => clearInterval(interval)
	}, [localParticipant])

	// @dev: Toggle screen sharing
	const toggleScreenShare = async () => {
		if (!canPublish) return

		if (isScreenSharing) {
			// @dev: Stop screen sharing
			if (screenShareTrack) {
				await localParticipant.unpublishTrack(screenShareTrack)
				screenShareTrack.stop()
				setScreenShareTrack(undefined)
			}
			
			// @dev: Restore camera
			if (localVideoTrack) {
				await localParticipant.publishTrack(localVideoTrack)
			}
			setIsScreenSharing(false)
		} else {
			// @dev: Start screen sharing
			try {
				const screenTracks = await createLocalScreenTracks({ audio: false })
				const screenTrack = screenTracks.find(t => t.kind === Track.Kind.Video) as LocalVideoTrack
				
				if (screenTrack) {
					// @dev: Unpublish camera if active
					if (localVideoTrack) {
						await localParticipant.unpublishTrack(localVideoTrack)
					}
					
					// @dev: Publish screen
					await localParticipant.publishTrack(screenTrack)
					setScreenShareTrack(screenTrack)
					setIsScreenSharing(true)
					
					// @dev: Handle screen share ended by user
					screenTrack.on('ended', () => {
						toggleScreenShare()
					})
				}
			} catch (error) {
				console.error("Failed to share screen:", error)
			}
		}
	}

	// @dev: Get unique remote tracks, filtering out local participant and duplicates
	const allTracks = useTracks([Track.Source.Camera])
	const remoteVideoTracks = allTracks
		.filter((t) => t.participant.identity !== localParticipant.identity)
		.filter((track, index, self) => 
			index === self.findIndex((t) => 
				t.participant.identity === track.participant.identity && 
				t.publication?.source === track.publication?.source
			)
		)
	
	const remoteScreenTracks = useTracks([Track.Source.ScreenShare])
		.filter((t) => t.participant.identity !== localParticipant.identity)
		.filter((track, index, self) => 
			index === self.findIndex((t) => 
				t.participant.identity === track.participant.identity
			)
		)

	const remoteAudioTracks = useTracks([Track.Source.Microphone])
		.filter((t) => t.participant.identity !== localParticipant.identity)
		.filter((track, index, self) => 
			index === self.findIndex((t) => 
				t.participant.identity === track.participant.identity
			)
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
				roomName: roomName,
			}),
		})
	}

	const copyLink = () => {
		const link = `${window.location.origin}/stream/room/${roomName}`
		navigator.clipboard.writeText(link)
		setCopied(true)
		setTimeout(() => setCopied(false), 2000)
	}

	// @dev: Show local video for hosts AND accepted invited participants
	const shouldShowLocalVideo = isHost || isInvitedParticipant
	
	// @dev: Build list of all video feeds to display
	const allVideoFeeds = []
	
	// @dev: Add local camera feed (even if camera is off)
	if (shouldShowLocalVideo) {
		allVideoFeeds.push({
			id: `local-camera-${localParticipant.identity}`,
			type: 'local-camera',
			participant: localParticipant,
			track: localVideoTrack // Can be undefined if camera is off
		})
	}
	
	// @dev: Add local screen share as separate feed
	if (shouldShowLocalVideo && isScreenSharing && screenShareTrack) {
		allVideoFeeds.push({
			id: `local-screen-${localParticipant.identity}`,
			type: 'local-screen',
			participant: localParticipant,
			track: screenShareTrack
		})
	}
	
	// @dev: Add remote screen shares
	remoteScreenTracks.forEach(t => {
		allVideoFeeds.push({
			id: `remote-screen-${t.participant.identity}`,
			type: 'remote-screen',
			participant: t.participant,
			trackRef: t
		})
	})
	
	// @dev: Add remote cameras
	remoteVideoTracks.forEach(t => {
		allVideoFeeds.push({
			id: `remote-camera-${t.participant.identity}`,
			type: 'remote-camera',
			participant: t.participant,
			trackRef: t
		})
	})
	
	// @dev: Determine layout based on pinned video
	const pinnedFeed = allVideoFeeds.find(f => f.id === pinnedVideoId)
	const unpinnedFeeds = allVideoFeeds.filter(f => f.id !== pinnedVideoId)
	
	const totalVideoCount = allVideoFeeds.length
	const gridCols = pinnedVideoId ? "grid-cols-1" : totalVideoCount > 2 ? "grid-cols-2" : totalVideoCount > 1 ? "grid-cols-2" : "grid-cols-1"

	return (
		<div className="relative h-full w-full bg-black">
			{/* @dev: Only render media controls for hosts or accepted participants */}
			{canPublish && <HostMediaControls localVideoTrack={localVideoTrack} />}
			
			<div className="absolute inset-0 flex flex-col p-4">
				{/* @dev: Pinned video takes main stage */}
				{pinnedFeed && (
					<div className="flex-1 mb-2">
						<RenderVideoFeed 
							feed={pinnedFeed} 
							isPinned={true}
							onPin={() => setPinnedVideoId(null)}
							localVideoEl={localVideoEl}
							isLocal={pinnedFeed.participant.identity === localParticipant.identity}
						/>
					</div>
				)}
				
				{/* @dev: Unpinned videos in grid or scrollable row */}
				<div className={pinnedVideoId ? "h-32 overflow-x-auto" : "flex-1"}>
					<div className={cn(
						pinnedVideoId ? "flex gap-2 h-full" : `grid gap-2 h-full ${gridCols}`
					)}>
						{(pinnedVideoId ? unpinnedFeeds : allVideoFeeds).map(feed => (
							<div 
								key={feed.id} 
								className={pinnedVideoId ? "flex-shrink-0 w-48" : ""}
							>
								<RenderVideoFeed 
									feed={feed}
									isPinned={false}
									onPin={() => setPinnedVideoId(feed.id)}
									localVideoEl={localVideoEl}
									isLocal={feed.participant.identity === localParticipant.identity}
								/>
							</div>
						))}
					</div>
				</div>
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
						
						{canPublish && (
							<>
								<Button
									size="sm"
									variant={isScreenSharing ? "destructive" : "secondary"}
									onClick={toggleScreenShare}
									className="bg-background/80 backdrop-blur-sm"
								>
									{isScreenSharing ? (
										<>
											<MonitorOff className="mr-2 h-3 w-3" />
											Stop Sharing
										</>
									) : (
										<>
											<Monitor className="mr-2 h-3 w-3" />
											Share Screen
										</>
									)}
								</Button>
								
								{/* @dev: Media device controls */}
								<div className="bg-background/80 backdrop-blur-sm rounded-md p-1">
									<MediaDeviceSelector />
								</div>
							</>
						)}
						
						{roomName && isInvitedParticipant && (
							<Button 
								size="sm" 
								variant="destructive"
								onClick={onLeaveStage}
								className="bg-red-600/90 hover:bg-red-600 backdrop-blur-sm"
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
									variant={showNotification && isHost ? "destructive" : "secondary"}
									disabled={roomState !== ConnectionState.Connected}
									className={cn(
										"backdrop-blur-sm",
										showNotification && isHost 
											? "bg-red-500/80 hover:bg-red-500 animate-pulse" 
											: "bg-background/80"
									)}
								>
									<Eye className="h-4 w-4 mr-2" />
									{roomState === ConnectionState.Connected ? participants.length : "0"}
									{showNotification && isHost && (
										<span className="ml-2 text-xs">Hand Raised!</span>
									)}
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