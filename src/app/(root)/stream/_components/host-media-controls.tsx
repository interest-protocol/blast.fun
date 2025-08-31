"use client"

import { useEffect } from "react"
import { useMediaDeviceSelect } from "@livekit/components-react"
import { LocalVideoTrack } from "livekit-client"

interface HostMediaControlsProps {
	localVideoTrack: LocalVideoTrack | undefined
}

export function HostMediaControls({ localVideoTrack }: HostMediaControlsProps) {
	const { activeDeviceId: activeCameraDeviceId } = useMediaDeviceSelect({
		kind: "videoinput",
	})

	useEffect(() => {
		if (localVideoTrack && activeCameraDeviceId) {
			void localVideoTrack.setDeviceId(activeCameraDeviceId)
		}
	}, [localVideoTrack, activeCameraDeviceId])

	return null // @dev: This component only handles device selection logic
}