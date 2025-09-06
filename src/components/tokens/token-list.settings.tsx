"use client"

import { Settings2 } from "lucide-react"
import { memo, useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

export type SortOption = "marketCap" | "date" | "volume" | "holders" | "bondingCurve"

export interface SocialFilters {
	requireWebsite: boolean
	requireTwitter: boolean
	requireTelegram: boolean
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

const STORAGE_KEY_PREFIX = "token-filters-"

export const TokenListSettingsDialog = memo(function TokenListSettingsDialog({
	columnId,
	onSettingsChange,
	defaultSort = "date",
	availableSortOptions = DEFAULT_SORT_OPTIONS,
}: TokenListSettingsProps) {
	const [open, setOpen] = useState(false)
	const [sortBy, setSortBy] = useState<SortOption>(defaultSort)
	const [socialFilters, setSocialFilters] = useState<SocialFilters>({
		requireWebsite: false,
		requireTwitter: false,
		requireTelegram: false,
	})

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
		}
		// @dev: don't call onSettingsChange for defaults - parent should handle initial state
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [columnId, onSettingsChange])

	const handleSave = () => {
		const settings: TokenListSettings = {
			sortBy,
			socialFilters,
		}

		const storageKey = `${STORAGE_KEY_PREFIX}${columnId}`
		localStorage.setItem(storageKey, JSON.stringify(settings))

		onSettingsChange(settings)

		setOpen(false)
	}

	const handleReset = () => {
		const defaultSettings: TokenListSettings = {
			sortBy: defaultSort,
			socialFilters: {
				requireWebsite: false,
				requireTwitter: false,
				requireTelegram: false,
			},
		}

		setSortBy(defaultSort)
		setSocialFilters(defaultSettings.socialFilters)

		const storageKey = `${STORAGE_KEY_PREFIX}${columnId}`
		localStorage.removeItem(storageKey)

		onSettingsChange(defaultSettings)
	}

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button
					variant="ghost"
					size="sm"
					className="h-7 w-7 p-0 transition-colors hover:bg-primary/10"
					aria-label="Token list settings"
				>
					<Settings2 className="h-4 w-4 text-muted-foreground transition-colors hover:text-foreground" />
				</Button>
			</DialogTrigger>
			<DialogContent className="border-2 bg-background/95 backdrop-blur-sm sm:max-w-[425px]">
				<DialogHeader className="border-b pb-3">
					<DialogTitle className="font-mono text-lg uppercase tracking-wider">LIST::SETTINGS</DialogTitle>
				</DialogHeader>

				<div className="mt-4 space-y-5">
					{/* Sorting Section */}
					<div className="space-y-3">
						<div className="border-b pb-2">
							<h3 className="font-mono text-foreground/80 text-xs uppercase tracking-wider">
								SORT::PARAMETERS
							</h3>
						</div>
						<RadioGroup value={sortBy} onValueChange={(value) => setSortBy(value as SortOption)}>
							{availableSortOptions.map((option) => (
								<div key={option.value} className="group flex items-center space-x-3">
									<RadioGroupItem
										value={option.value}
										id={option.value}
										className="border-muted-foreground/50 data-[state=checked]:border-primary data-[state=checked]:text-primary"
									/>
									<Label
										htmlFor={option.value}
										className="cursor-pointer font-mono text-muted-foreground text-xs uppercase tracking-wider transition-colors group-hover:text-foreground/80"
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
							<h3 className="font-mono text-foreground/80 text-xs uppercase tracking-wider">
								SOCIAL::FILTERS
							</h3>
						</div>
						<div className="space-y-3">
							<div className="group flex items-center space-x-3">
								<Checkbox
									id="website"
									checked={socialFilters.requireWebsite}
									onCheckedChange={(checked) =>
										setSocialFilters((prev) => ({ ...prev, requireWebsite: !!checked }))
									}
									className="border-muted-foreground/50 data-[state=checked]:border-primary data-[state=checked]:bg-primary/10"
								/>
								<Label
									htmlFor="website"
									className="cursor-pointer font-mono text-muted-foreground text-xs uppercase tracking-wider transition-colors group-hover:text-foreground/80"
								>
									WEBSITE::LINK
								</Label>
							</div>

							<div className="group flex items-center space-x-3">
								<Checkbox
									id="twitter"
									checked={socialFilters.requireTwitter}
									onCheckedChange={(checked) =>
										setSocialFilters((prev) => ({ ...prev, requireTwitter: !!checked }))
									}
									className="border-muted-foreground/50 data-[state=checked]:border-primary data-[state=checked]:bg-primary/10"
								/>
								<Label
									htmlFor="twitter"
									className="cursor-pointer font-mono text-muted-foreground text-xs uppercase tracking-wider transition-colors group-hover:text-foreground/80"
								>
									TWITTER::X
								</Label>
							</div>

							<div className="group flex items-center space-x-3">
								<Checkbox
									id="telegram"
									checked={socialFilters.requireTelegram}
									onCheckedChange={(checked) =>
										setSocialFilters((prev) => ({ ...prev, requireTelegram: !!checked }))
									}
									className="border-muted-foreground/50 data-[state=checked]:border-primary data-[state=checked]:bg-primary/10"
								/>
								<Label
									htmlFor="telegram"
									className="cursor-pointer font-mono text-muted-foreground text-xs uppercase tracking-wider transition-colors group-hover:text-foreground/80"
								>
									TELEGRAM::CHANNEL
								</Label>
							</div>
						</div>
					</div>
				</div>

				<div className="mt-5 border-t pt-4">
					<div className="flex items-center justify-between">
						<Button
							variant="ghost"
							onClick={handleReset}
							size="sm"
							className="font-mono text-destructive/80 text-xs uppercase tracking-wider transition-all hover:bg-destructive/10 hover:text-destructive"
						>
							RESET::DEFAULTS
						</Button>
						<div className="flex gap-2">
							<Button
								variant="outline"
								onClick={() => setOpen(false)}
								size="sm"
								className="border-muted-foreground/30 font-mono text-muted-foreground text-xs uppercase tracking-wider transition-all hover:border-muted-foreground/50 hover:bg-muted/30 hover:text-foreground"
							>
								CANCEL
							</Button>
							<Button
								onClick={handleSave}
								size="sm"
								className="border border-primary bg-primary/80 font-mono text-primary-foreground text-xs uppercase tracking-wider transition-all hover:bg-primary hover:shadow-lg hover:shadow-primary/20"
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
