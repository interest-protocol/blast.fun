"use client"

import { useState, useEffect } from "react"
import { Volume2, VolumeX } from "lucide-react"
import { Button } from "@/components/ui/button"
import { AudioDialog } from "./audio-dialog"
import { audioManager, type AudioSettings } from "@/lib/audio-manager"
import { useMounted } from "@/hooks/use-mounted"

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
	}, []);

	if (!isMounted) return null

	return (
		<>
			<Button
				size="icon"
				variant="outline"
				onClick={() => setOpen(true)}
				className="rounded-xl ease-in-out duration-300 transition-all"
			>
				{settings.enabled ? (
					<Volume2 className="h-6 w-6" />
				) : (
					<VolumeX className="h-6 w-6" />
				)}
			</Button>
			<AudioDialog open={open} onOpenChange={setOpen} />
		</>
	)
}