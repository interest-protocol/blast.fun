"use client"

import { useState, useEffect } from "react"
import { useLocalParticipant, useMediaDeviceSelect } from "@livekit/components-react"
import { Track } from "livekit-client"
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Mic, MicOff, Video, VideoOff, Settings } from "lucide-react"
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover"
import { Label } from "@/components/ui/label"

export function MediaDeviceSelector() {
	const { localParticipant } = useLocalParticipant()
	const [isCameraEnabled, setIsCameraEnabled] = useState(true)
	const [isMicEnabled, setIsMicEnabled] = useState(true)
	
	const {
		devices: cameras,
		activeDeviceId: activeCameraId,
		setActiveMediaDevice: setActiveCamera,
	} = useMediaDeviceSelect({ kind: "videoinput" })
	
	const {
		devices: microphones,
		activeDeviceId: activeMicId,
		setActiveMediaDevice: setActiveMic,
	} = useMediaDeviceSelect({ kind: "audioinput" })
	
	// @dev: Check initial state
	useEffect(() => {
		const checkInitialState = () => {
			// @dev: Check camera state
			const cameraPublication = Array.from(localParticipant.videoTrackPublications.values())
				.find(pub => pub.source === Track.Source.Camera)
			if (cameraPublication) {
				// @dev: LiveKit's muted state is the source of truth
				setIsCameraEnabled(!cameraPublication.isMuted)
			}
			
			// @dev: Check mic state  
			const micPublication = Array.from(localParticipant.audioTrackPublications.values())
				.find(pub => pub.source === Track.Source.Microphone)
			if (micPublication) {
				// @dev: LiveKit's muted state is the source of truth
				setIsMicEnabled(!micPublication.isMuted)
			}
		}
		
		checkInitialState()
		// @dev: Re-check when tracks change
		const interval = setInterval(checkInitialState, 1000)
		return () => clearInterval(interval)
	}, [localParticipant])
	
	// @dev: Toggle camera on/off using LiveKit's built-in method
	const toggleCamera = async () => {
		const newState = !isCameraEnabled
		try {
			setIsCameraEnabled(newState)
			await localParticipant.setCameraEnabled(newState)
			console.log(`Camera ${newState ? 'enabled' : 'disabled'}`)
		} catch (error) {
			console.error("Error toggling camera:", error)
			// @dev: Revert state if error
			setIsCameraEnabled(!newState)
		}
	}
	
	// @dev: Toggle microphone on/off using LiveKit's built-in method
	const toggleMic = async () => {
		const newState = !isMicEnabled
		try {
			setIsMicEnabled(newState)
			await localParticipant.setMicrophoneEnabled(newState)
			console.log(`Microphone ${newState ? 'enabled' : 'disabled'}`)
		} catch (error) {
			console.error("Error toggling microphone:", error)
			// @dev: Revert state if error
			setIsMicEnabled(!newState)
		}
	}
	
	return (
		<div className="flex items-center gap-2">
			{/* @dev: Camera toggle */}
			<Button
				size="sm"
				variant={isCameraEnabled ? "secondary" : "destructive"}
				onClick={toggleCamera}
				className="h-8 w-8 p-0"
			>
				{isCameraEnabled ? (
					<Video className="h-4 w-4" />
				) : (
					<VideoOff className="h-4 w-4" />
				)}
			</Button>
			
			{/* @dev: Microphone toggle */}
			<Button
				size="sm"
				variant={isMicEnabled ? "secondary" : "destructive"}
				onClick={toggleMic}
				className="h-8 w-8 p-0"
			>
				{isMicEnabled ? (
					<Mic className="h-4 w-4" />
				) : (
					<MicOff className="h-4 w-4" />
				)}
			</Button>
			
			{/* @dev: Device settings */}
			<Popover>
				<PopoverTrigger asChild>
					<Button
						size="sm"
						variant="secondary"
						className="h-8 w-8 p-0"
					>
						<Settings className="h-4 w-4" />
					</Button>
				</PopoverTrigger>
				<PopoverContent className="w-80" align="end">
					<div className="space-y-4">
						<div className="space-y-2">
							<Label className="text-xs font-medium">Camera</Label>
							<Select
								value={activeCameraId}
								onValueChange={(deviceId) => setActiveCamera(deviceId)}
							>
								<SelectTrigger className="w-full">
									<SelectValue placeholder="Select camera" />
								</SelectTrigger>
								<SelectContent>
									{cameras.map((device) => (
										<SelectItem key={device.deviceId} value={device.deviceId}>
											{device.label || `Camera ${device.deviceId.slice(0, 5)}`}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
						
						<div className="space-y-2">
							<Label className="text-xs font-medium">Microphone</Label>
							<Select
								value={activeMicId}
								onValueChange={(deviceId) => setActiveMic(deviceId)}
							>
								<SelectTrigger className="w-full">
									<SelectValue placeholder="Select microphone" />
								</SelectTrigger>
								<SelectContent>
									{microphones.map((device) => (
										<SelectItem key={device.deviceId} value={device.deviceId}>
											{device.label || `Microphone ${device.deviceId.slice(0, 5)}`}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
					</div>
				</PopoverContent>
			</Popover>
		</div>
	)
}