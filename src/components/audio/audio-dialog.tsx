"use client"

import { useState, useEffect, useRef } from "react"
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { Volume2, VolumeX } from "lucide-react"
import { audioManager, type AudioSettings } from "@/lib/audio-manager"
import { Logo } from "@/components/ui/logo"

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
	}, [isEditingVolume]);

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
		const value = e.target.value.replace(/[^0-9]/g, '')
		if (value === '' || (parseInt(value) >= 0 && parseInt(value) <= 100)) {
			setVolumeInput(value)
		}
	}

	const handleVolumeInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === 'Enter') {
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
			<DialogContent className="sm:max-w-[400px] backdrop-blur-sm border-2 shadow-2xl">
				<DialogHeader className="pb-2 border-b">
					<DialogTitle className="font-mono text-base uppercase tracking-wider text-foreground/80">
						Audio Settings
					</DialogTitle>
					<DialogDescription>
						Toggle miscellanous sounds for new tokens, and buying & selling.
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-2">
					<div className="flex items-center justify-between p-3 rounded-lg border border-border/40 bg-background/30">
						<div className="space-y-0.5">
							<Label className="font-mono text-xs uppercase tracking-wider text-foreground/80">
								SYSTEM AUDIO
							</Label>
						</div>
						<Switch
							id="audio-enabled"
							checked={localEnabled}
							onCheckedChange={handleEnabledChange}
							className="data-[state=unchecked]:bg-muted data-[state=checked]:bg-destructive/20 dark:data-[state=checked]:bg-destructive"
						/>
					</div>

					{localEnabled && (
						<div className="space-y-3">
							<div className="p-3 rounded-lg border border-border/40 bg-background/30">
								<div className="flex items-center justify-between mb-3">
									<Label className="font-mono text-xs uppercase tracking-wider text-foreground/80">
										VOLUME LEVEL
									</Label>
									<div className="relative flex items-center select-none">
										<input
											ref={volumeInputRef}
											type="text"
											value={volumeInput}
											onChange={handleVolumeInputChange}
											onKeyDown={handleVolumeInputKeyDown}
											onFocus={handleVolumeInputFocus}
											onBlur={handleVolumeInputBlur}
											className="w-10 text-right font-mono text-xs uppercase bg-transparent border-b border-transparent hover:border-primary/40 focus:border-primary focus:outline-none transition-colors cursor-pointer"
										/>
										<span className="font-mono text-xs uppercase text-muted-foreground ml-0.5">%</span>
									</div>
								</div>
								<div className="flex items-center gap-2">
									<VolumeX className="w-3 h-3 text-muted-foreground/60" />
									<Slider
										value={[settings.volume]}
										onValueChange={handleVolumeChange}
										min={0}
										max={1}
										step={0.01}
										className="flex-1"
									/>
									<Volume2 className="w-3 h-3 text-muted-foreground/60" />
								</div>
							</div>
						</div>
					)}

					{!localEnabled && (
						<div className="text-center py-2">
							<Logo className="w-8 h-8 mx-auto mb-2" />
							<p className="font-mono text-xs uppercase text-muted-foreground">
								AUDIO::DISABLED
							</p>
						</div>
					)}
				</div>
			</DialogContent>
		</Dialog>
	)
}