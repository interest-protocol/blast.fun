"use client"

import { Volume2, VolumeX } from "lucide-react"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { useMounted } from "@/hooks/use-mounted"
import { type AudioSettings, audioManager } from "@/lib/audio-manager"
import { AudioDialog } from "./audio-dialog"

export function AudioToggle() {
	const [open, setOpen] = useState(false)
	const [settings, setSettings] = useState<AudioSettings>(audioManager.getSettings())

	const isMounted = useMounted()

	useEffect(() => {
		const unsubscribe = audioManager.subscribe((newSettings) => {
			setSettings(newSettings)
		})

		return () => {
			unsubscribe()
		}
	}, [])

	if (!isMounted) return null

	return (
		<>
			<Button
				size="icon"
				variant="outline"
				onClick={() => setOpen(true)}
				className="rounded-xl transition-all duration-300 ease-in-out"
			>
				{settings.enabled ? <Volume2 className="h-6 w-6" /> : <VolumeX className="h-6 w-6" />}
			</Button>
			<AudioDialog open={open} onOpenChange={setOpen} />
		</>
	)
}
