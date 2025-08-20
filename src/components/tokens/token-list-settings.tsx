"use client"

import { memo, useState, useEffect } from "react"
import { Settings2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { Logo } from "@/components/ui/logo"

export type SortOption = "marketCap" | "date" | "volume" | "holders" | "bondingCurve"

export interface SocialFilters {
	requireWebsite: boolean
	requireTwitter: boolean
	requireTelegram: boolean
	requireDiscord: boolean
}

export interface TokenListSettings {
	sortBy: SortOption
	socialFilters: SocialFilters
}

interface TokenListSettingsProps {
	columnId: string // unique identifier for the column (e.g., "graduated", "new", "graduating")
	onSettingsChange: (settings: TokenListSettings) => void
	defaultSort?: SortOption
	availableSortOptions?: {
		value: SortOption
		label: string
	}[]
}

const DEFAULT_SORT_OPTIONS = [
	{ value: "marketCap" as SortOption, label: "Market Cap" },
	{ value: "date" as SortOption, label: "Recent" },
	{ value: "volume" as SortOption, label: "24h Volume" },
	{ value: "holders" as SortOption, label: "Holders" },
]

const STORAGE_KEY_PREFIX = "token-list-settings-"

export const TokenListSettingsDialog = memo(function TokenListSettingsDialog({
	columnId,
	onSettingsChange,
	defaultSort = "date",
	availableSortOptions = DEFAULT_SORT_OPTIONS
}: TokenListSettingsProps) {
	const [open, setOpen] = useState(false)
	const [sortBy, setSortBy] = useState<SortOption>(defaultSort)
	const [socialFilters, setSocialFilters] = useState<SocialFilters>({
		requireWebsite: false,
		requireTwitter: false,
		requireTelegram: false,
		requireDiscord: false,
	})

	// Load settings from localStorage on mount
	useEffect(() => {
		const storageKey = `${STORAGE_KEY_PREFIX}${columnId}`
		const savedSettings = localStorage.getItem(storageKey)
		
		if (savedSettings) {
			try {
				const parsed = JSON.parse(savedSettings) as TokenListSettings
				setSortBy(parsed.sortBy)
				setSocialFilters(parsed.socialFilters)
				onSettingsChange(parsed)
			} catch (error) {
				console.error("Failed to parse saved settings:", error)
			}
		} else {
			// Apply default settings
			const defaultSettings: TokenListSettings = {
				sortBy: defaultSort,
				socialFilters: {
					requireWebsite: false,
					requireTwitter: false,
					requireTelegram: false,
					requireDiscord: false,
				}
			}
			onSettingsChange(defaultSettings)
		}
	}, [columnId, defaultSort, onSettingsChange])

	const handleSave = () => {
		const settings: TokenListSettings = {
			sortBy,
			socialFilters
		}
		
		// Save to localStorage
		const storageKey = `${STORAGE_KEY_PREFIX}${columnId}`
		localStorage.setItem(storageKey, JSON.stringify(settings))
		
		// Notify parent component
		onSettingsChange(settings)
		
		// Close dialog
		setOpen(false)
	}

	const handleReset = () => {
		const defaultSettings: TokenListSettings = {
			sortBy: defaultSort,
			socialFilters: {
				requireWebsite: false,
				requireTwitter: false,
				requireTelegram: false,
				requireDiscord: false,
			}
		}
		
		setSortBy(defaultSort)
		setSocialFilters(defaultSettings.socialFilters)
		
		// Clear from localStorage
		const storageKey = `${STORAGE_KEY_PREFIX}${columnId}`
		localStorage.removeItem(storageKey)
		
		// Notify parent component
		onSettingsChange(defaultSettings)
	}

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button 
					variant="ghost" 
					size="sm" 
					className="h-7 w-7 p-0 hover:bg-primary/10 transition-colors"
					aria-label="Token list settings"
				>
					<Settings2 className="h-4 w-4 text-muted-foreground hover:text-foreground transition-colors" />
				</Button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-[425px] border-2 bg-background/95 backdrop-blur-sm">
				<DialogHeader className="border-b pb-3">
					<DialogTitle className="text-lg font-mono uppercase tracking-wider">
						LIST::SETTINGS
					</DialogTitle>
				</DialogHeader>
				
				<div className="space-y-5 mt-4">
					{/* Sorting Section */}
					<div className="space-y-3">
						<div className="border-b pb-2">
							<h3 className="font-mono text-xs uppercase tracking-wider text-foreground/80">
								SORT::PARAMETERS
							</h3>
						</div>
						<RadioGroup value={sortBy} onValueChange={(value) => setSortBy(value as SortOption)}>
							{availableSortOptions.map((option) => (
								<div key={option.value} className="flex items-center space-x-3 group">
									<RadioGroupItem 
										value={option.value} 
										id={option.value}
										className="border-muted-foreground/50 data-[state=checked]:border-primary data-[state=checked]:text-primary"
									/>
									<Label 
										htmlFor={option.value} 
										className="font-mono text-xs uppercase tracking-wider cursor-pointer text-muted-foreground group-hover:text-foreground/80 transition-colors"
									>
										{option.label}
									</Label>
								</div>
							))}
						</RadioGroup>
					</div>
					
					{/* Social Filters Section */}
					<div className="space-y-3">
						<div className="border-b pb-2">
							<h3 className="font-mono text-xs uppercase tracking-wider text-foreground/80">
								SOCIAL::FILTERS
							</h3>
						</div>
						<div className="space-y-3">
							<div className="flex items-center space-x-3 group">
								<Checkbox
									id="website"
									checked={socialFilters.requireWebsite}
									onCheckedChange={(checked) => 
										setSocialFilters(prev => ({ ...prev, requireWebsite: !!checked }))
									}
									className="border-muted-foreground/50 data-[state=checked]:border-primary data-[state=checked]:bg-primary/10"
								/>
								<Label 
									htmlFor="website" 
									className="font-mono text-xs uppercase tracking-wider cursor-pointer text-muted-foreground group-hover:text-foreground/80 transition-colors"
								>
									WEBSITE::LINK
								</Label>
							</div>
							
							<div className="flex items-center space-x-3 group">
								<Checkbox
									id="twitter"
									checked={socialFilters.requireTwitter}
									onCheckedChange={(checked) => 
										setSocialFilters(prev => ({ ...prev, requireTwitter: !!checked }))
									}
									className="border-muted-foreground/50 data-[state=checked]:border-primary data-[state=checked]:bg-primary/10"
								/>
								<Label 
									htmlFor="twitter" 
									className="font-mono text-xs uppercase tracking-wider cursor-pointer text-muted-foreground group-hover:text-foreground/80 transition-colors"
								>
									TWITTER::X
								</Label>
							</div>
							
							<div className="flex items-center space-x-3 group">
								<Checkbox
									id="telegram"
									checked={socialFilters.requireTelegram}
									onCheckedChange={(checked) => 
										setSocialFilters(prev => ({ ...prev, requireTelegram: !!checked }))
									}
									className="border-muted-foreground/50 data-[state=checked]:border-primary data-[state=checked]:bg-primary/10"
								/>
								<Label 
									htmlFor="telegram" 
									className="font-mono text-xs uppercase tracking-wider cursor-pointer text-muted-foreground group-hover:text-foreground/80 transition-colors"
								>
									TELEGRAM::CHANNEL
								</Label>
							</div>
							
							<div className="flex items-center space-x-3 group">
								<Checkbox
									id="discord"
									checked={socialFilters.requireDiscord}
									onCheckedChange={(checked) => 
										setSocialFilters(prev => ({ ...prev, requireDiscord: !!checked }))
									}
									className="border-muted-foreground/50 data-[state=checked]:border-primary data-[state=checked]:bg-primary/10"
								/>
								<Label 
									htmlFor="discord" 
									className="font-mono text-xs uppercase tracking-wider cursor-pointer text-muted-foreground group-hover:text-foreground/80 transition-colors"
								>
									DISCORD::SERVER
								</Label>
							</div>
						</div>
					</div>
				</div>
				
				<div className="border-t pt-4 mt-5">
					<div className="flex justify-between items-center">
						<Button 
							variant="ghost" 
							onClick={handleReset}
							size="sm"
							className="font-mono text-xs uppercase tracking-wider text-destructive/80 hover:text-destructive hover:bg-destructive/10 transition-all"
						>
							RESET::DEFAULTS
						</Button>
						<div className="flex gap-2">
							<Button 
								variant="outline" 
								onClick={() => setOpen(false)}
								size="sm"
								className="font-mono text-xs uppercase tracking-wider border-muted-foreground/30 text-muted-foreground hover:text-foreground hover:bg-muted/30 hover:border-muted-foreground/50 transition-all"
							>
								CANCEL
							</Button>
							<Button 
								onClick={handleSave}
								size="sm"
								className="font-mono text-xs uppercase tracking-wider bg-primary/80 hover:bg-primary text-primary-foreground hover:shadow-lg hover:shadow-primary/20 border border-primary transition-all"
							>
								SAVE::CONFIG
							</Button>
						</div>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	)
})