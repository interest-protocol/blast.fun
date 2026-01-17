"use client"

import { useState, useEffect, FC } from "react"
import { Volume2, VolumeX } from "lucide-react"

import { Button } from "@/components/ui/button"
import { useMounted } from "@/hooks/use-mounted"
import { audioManager, type AudioSettings } from "@/lib/audio-manager"
import AudioDialog from "./audio-dialog"

export const AudioToggle: FC = () => {
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
				variant="ghost"
				onClick={() => setOpen(true)}
				className="size-8 rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all"
			>
				{settings.enabled ? (
					<Volume2 className="size-4" />
				) : (
					<VolumeX className="size-4" />
				)}
			</Button>
			<AudioDialog open={open} onOpenChange={setOpen} />
		</>
	)
}
