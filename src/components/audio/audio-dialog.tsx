"use client"

import { Volume2, VolumeX } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Logo } from "@/components/ui/logo"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { type AudioSettings, audioManager } from "@/lib/audio-manager"

interface AudioDialogProps {
	open: boolean
	onOpenChange: (open: boolean) => void
}

export function AudioDialog({ open, onOpenChange }: AudioDialogProps) {
	const [settings, setSettings] = useState<AudioSettings>(audioManager.getSettings())
	const [volumeInput, setVolumeInput] = useState(Math.round(settings.volume * 100).toString())
	const [isEditingVolume, setIsEditingVolume] = useState(false)
	const [localEnabled, setLocalEnabled] = useState(settings.enabled)
	const volumeInputRef = useRef<HTMLInputElement>(null)

	useEffect(() => {
		if (open) {
			const currentSettings = audioManager.getSettings()
			setSettings(currentSettings)
			setLocalEnabled(currentSettings.enabled)
			setVolumeInput(Math.round(currentSettings.volume * 100).toString())
		}
	}, [open])

	useEffect(() => {
		const unsubscribe = audioManager.subscribe((newSettings) => {
			setSettings(newSettings)
			setLocalEnabled(newSettings.enabled)

			if (!isEditingVolume) {
				setVolumeInput(Math.round(newSettings.volume * 100).toString())
			}
		})

		return () => {
			unsubscribe()
		}
	}, [isEditingVolume])

	const handleEnabledChange = (enabled: boolean) => {
		// workaround: using audioManager property directly causes fucky UX.
		setLocalEnabled(enabled)

		audioManager.setEnabled(enabled)
	}

	const handleVolumeChange = (value: number[]) => {
		audioManager.setVolume(value[0])
		setVolumeInput(Math.round(value[0] * 100).toString())
	}

	const handleVolumeInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value.replace(/[^0-9]/g, "")
		if (value === "" || (parseInt(value) >= 0 && parseInt(value) <= 100)) {
			setVolumeInput(value)
		}
	}

	const handleVolumeInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === "Enter") {
			volumeInputRef.current?.blur()
		}
	}

	const handleVolumeInputBlur = () => {
		setIsEditingVolume(false)
		const numValue = parseInt(volumeInput) || 0
		const clampedValue = Math.max(0, Math.min(100, numValue))
		audioManager.setVolume(clampedValue / 100)
		setVolumeInput(clampedValue.toString())
	}

	const handleVolumeInputFocus = () => {
		setIsEditingVolume(true)
		volumeInputRef.current?.select()
	}

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="border-2 shadow-2xl backdrop-blur-sm sm:max-w-[400px]">
				<DialogHeader className="border-b pb-2">
					<DialogTitle className="font-mono text-base text-foreground/80 uppercase tracking-wider">
						AUDIO::CONTROL
					</DialogTitle>
				</DialogHeader>

				<div className="space-y-2">
					<div className="flex items-center justify-between rounded-lg border border-border/40 bg-background/30 p-3">
						<div className="space-y-0.5">
							<Label
								htmlFor="audio-enabled"
								className="font-mono text-foreground/80 text-xs uppercase tracking-wider"
							>
								SYSTEM::AUDIO
							</Label>
							<p className="font-mono text-[10px] text-muted-foreground uppercase">
								{localEnabled ? "STATUS::ACTIVE" : "STATUS::INACTIVE"}
							</p>
						</div>
						<Switch
							id="audio-enabled"
							checked={localEnabled}
							onCheckedChange={handleEnabledChange}
							className="data-[state=checked]:bg-destructive/20 data-[state=unchecked]:bg-muted dark:data-[state=checked]:bg-destructive"
						/>
					</div>

					{localEnabled && (
						<div className="space-y-3">
							<div className="rounded-lg border border-border/40 bg-background/30 p-3">
								<div className="mb-3 flex items-center justify-between">
									<Label className="font-mono text-foreground/80 text-xs uppercase tracking-wider">
										VOLUME::LEVEL
									</Label>
									<div className="relative flex select-none items-center">
										<input
											ref={volumeInputRef}
											type="text"
											value={volumeInput}
											onChange={handleVolumeInputChange}
											onKeyDown={handleVolumeInputKeyDown}
											onFocus={handleVolumeInputFocus}
											onBlur={handleVolumeInputBlur}
											className="w-10 cursor-pointer border-transparent border-b bg-transparent text-right font-mono text-xs uppercase transition-colors hover:border-primary/40 focus:border-primary focus:outline-none"
										/>
										<span className="ml-0.5 font-mono text-muted-foreground text-xs uppercase">%</span>
									</div>
								</div>
								<div className="flex items-center gap-2">
									<VolumeX className="h-3 w-3 text-muted-foreground/60" />
									<Slider
										value={[settings.volume]}
										onValueChange={handleVolumeChange}
										min={0}
										max={1}
										step={0.01}
										className="flex-1"
									/>
									<Volume2 className="h-3 w-3 text-muted-foreground/60" />
								</div>
							</div>
						</div>
					)}

					{!localEnabled && (
						<div className="py-2 text-center">
							<Logo className="mx-auto mb-2 h-8 w-8" />
							<p className="font-mono text-muted-foreground text-xs uppercase">AUDIO::DISABLED</p>
						</div>
					)}
				</div>
			</DialogContent>
		</Dialog>
	)
}
