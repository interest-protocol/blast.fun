"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { DollarSign, Shield, ShieldCheck, Twitter, Upload, Users, UserX, Wallet, XIcon } from "lucide-react"
import { useCallback, useEffect, useMemo, useState } from "react"
import { useForm } from "react-hook-form"
import toast from "react-hot-toast"
import z from "zod"
import { Button } from "@/components/ui/button"
import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import useBalance from "@/hooks/sui/use-balance"
import { cn } from "@/utils"
import { getBase64 } from "../launch.utils"
import TokenCreationButton from "./create-token-button"

const tokenSchema = z.object({
	name: z.string().min(3, "Minimum 3 characters").max(20, "Maximum 20 characters"),
	symbol: z
		.string()
		.min(2, "Minimum 2 characters")
		.max(10, "Maximum 10 characters")
		.regex(/^[a-zA-Z][\x21-\x7E]*$/),
	description: z.string().min(10, "Minimum 10 characters").max(256, "Maximum 256 characters"),
	imageUrl: z.string().optional(),
	website: z.union([z.literal(""), z.string().url("Invalid URL")]).optional(),
	telegram: z.union([z.literal(""), z.string().url("Invalid URL")]).optional(),
	twitter: z.union([z.literal(""), z.string().url("Invalid URL")]).optional(),
	hideIdentity: z.boolean(),
	sniperProtection: z.boolean(),
	requireTwitter: z.boolean(),
	revealTraderIdentity: z.boolean(),
	minFollowerCount: z
		.string()
		.optional()
		.refine((val) => !val || Number(val) >= 0, "Must be a positive number"),
	maxHoldingPercent: z
		.string()
		.optional()
		.refine((val) => !val || (Number(val) >= 0.1 && Number(val) <= 100), "Must be between 0.1% and 100%"),
	devBuyAmount: z
		.string()
		.optional()
		.refine((val) => !val || Number(val) >= 0, "Must be a positive number"),
	burnTax: z
		.string()
		.optional()
		.refine((val) => !val || (Number(val) >= 0 && Number(val) <= 60), "Must be between 0% and 60%"),
})

export type TokenFormValues = z.infer<typeof tokenSchema>

interface CreateTokenFormProps {
	onFormChange?: (values: Partial<TokenFormValues>) => void
}

export default function CreateTokenForm({ onFormChange }: CreateTokenFormProps) {
	const [isDragging, setIsDragging] = useState(false)
	const [showProtectionSettings, setShowProtectionSettings] = useState(true) // Default to true since sniperProtection defaults to true
	const { balance } = useBalance({ autoRefetch: true, autoRefetchInterval: 5000 })

	const form = useForm<TokenFormValues>({
		resolver: zodResolver(tokenSchema),
		defaultValues: {
			name: "",
			symbol: "",
			description: "",
			imageUrl: "",
			website: "",
			telegram: "",
			twitter: "",
			hideIdentity: false,
			sniperProtection: true, // Default to enabled
			requireTwitter: false,
			revealTraderIdentity: false,
			minFollowerCount: "",
			maxHoldingPercent: "",
			devBuyAmount: "",
			burnTax: "",
		},
		mode: "onBlur",
	})

	const imageUrl = form.watch("imageUrl")
	const tokenName = form.watch("name")
	const tokenSymbol = form.watch("symbol")
	const description = form.watch("description")
	const hideIdentity = form.watch("hideIdentity")
	const sniperProtection = form.watch("sniperProtection")
	const requireTwitter = form.watch("requireTwitter")
	const minFollowerCount = form.watch("minFollowerCount")
	const maxHoldingPercent = form.watch("maxHoldingPercent")
	const devBuyAmount = form.watch("devBuyAmount")

	const formData = useMemo(
		() => ({
			imageUrl,
			name: tokenName,
			symbol: tokenSymbol,
			hideIdentity,
			sniperProtection,
			requireTwitter,
			minFollowerCount,
			maxHoldingPercent,
			devBuyAmount,
		}),
		[
			imageUrl,
			tokenName,
			tokenSymbol,
			hideIdentity,
			sniperProtection,
			requireTwitter,
			minFollowerCount,
			maxHoldingPercent,
			devBuyAmount,
		]
	)

	useEffect(() => {
		if (onFormChange) {
			onFormChange(formData)
		}
	}, [formData, onFormChange])

	const handleImageUpload = useCallback(
		async (file: File) => {
			if (!file.type.startsWith("image/")) {
				toast.error("INVALID::FILE_TYPE")
				return
			}

			try {
				const base64 = await getBase64(file)
				form.setValue("imageUrl", base64)
			} catch (error) {
				toast.error("UPLOAD::FAILED")
				console.error("Image upload error:", error)
			}
		},
		[form]
	)

	const handleDrop = useCallback(
		(e: React.DragEvent<HTMLDivElement>) => {
			e.preventDefault()
			setIsDragging(false)

			const file = e.dataTransfer.files[0]
			if (file) {
				handleImageUpload(file)
			}
		},
		[handleImageUpload]
	)

	const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
		e.preventDefault()
		setIsDragging(true)
	}, [])

	const handleDragLeave = useCallback(() => {
		setIsDragging(false)
	}, [])

	// @dev: Handle paste event for images
	const handlePaste = useCallback(
		async (e: React.ClipboardEvent) => {
			// @dev: Only process paste if no image is present
			if (imageUrl) return

			const items = e.clipboardData?.items
			if (!items) return

			for (const item of items) {
				if (item.type.startsWith("image/")) {
					e.preventDefault()
					const file = item.getAsFile()
					if (file) {
						handleImageUpload(file)
						break
					}
				}
			}
		},
		[handleImageUpload, imageUrl]
	)

	// @dev: Add paste event listener to the entire form
	useEffect(() => {
		const handleGlobalPaste = (e: ClipboardEvent) => {
			// @dev: Only handle paste when form is visible and no image is present
			if (!imageUrl && e.clipboardData?.items) {
				for (const item of e.clipboardData.items) {
					if (item.type.startsWith("image/")) {
						e.preventDefault()
						const file = item.getAsFile()
						if (file) {
							handleImageUpload(file)
							break
						}
					}
				}
			}
		}

		document.addEventListener("paste", handleGlobalPaste)
		return () => document.removeEventListener("paste", handleGlobalPaste)
	}, [handleImageUpload, imageUrl])

	return (
		<div className="w-full rounded-xl border-2 bg-background/50 p-4 shadow-2xl backdrop-blur-sm" onPaste={handlePaste}>
			<Form {...form}>
				<form className="space-y-6">
					<div className="flex gap-6">
						{/* Image Upload */}
						<FormField
							control={form.control}
							name="imageUrl"
							render={() => (
								<FormItem>
									<FormLabel className="font-mono text-foreground/60 text-xs uppercase tracking-wider">
										IMAGE::UPLOAD
									</FormLabel>
									<FormControl>
										<div
											className={cn(
												"relative h-[120px] w-[120px] rounded-lg border-2 border-dashed transition-all duration-200 ease-in-out",
												isDragging ? "border-primary bg-primary/5" : "hover:border-primary",
												imageUrl && "border-solid"
											)}
											onDrop={handleDrop}
											onDragOver={handleDragOver}
											onDragLeave={handleDragLeave}
										>
											{imageUrl ? (
												<>
													<img
														src={imageUrl}
														alt="Token"
														className="h-full w-full rounded-lg object-cover"
													/>
													<Button
														type="button"
														variant="destructive"
														size="icon"
														className="-top-2 -right-2 absolute h-6 w-6 rounded-full shadow-lg"
														onClick={() => form.setValue("imageUrl", "")}
													>
														<XIcon className="h-3 w-3" />
													</Button>
												</>
											) : (
												<label className="flex h-full w-full cursor-pointer flex-col items-center justify-center">
													<Upload className="mb-2 h-8 w-8 text-foreground/20" />
													<span className="font-mono text-foreground/40 text-xs uppercase">
														DROP::IMAGE
													</span>
													<span className="mt-1 font-mono text-[10px] text-foreground/30">
														OR PASTE
													</span>
													<input
														type="file"
														accept="image/*"
														className="hidden"
														onChange={(e) => {
															const file = e.target.files?.[0]
															if (file) handleImageUpload(file)
														}}
													/>
												</label>
											)}
										</div>
									</FormControl>
									<FormMessage className="font-mono text-xs" />
								</FormItem>
							)}
						/>

						{/* Token Name and Symbol */}
						<div className="flex-1 space-y-4">
							<FormField
								control={form.control}
								name="name"
								render={({ field }) => (
									<FormItem>
										<FormLabel className="font-mono text-foreground/60 text-xs uppercase tracking-wider">
											TOKEN::NAME
										</FormLabel>
										<FormControl>
											<Input
												placeholder="[ENTER_NAME]"
												className="font-mono focus:border-primary/50"
												{...field}
											/>
										</FormControl>
										<FormMessage className="font-mono text-xs" />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="symbol"
								render={({ field }) => (
									<FormItem>
										<FormLabel className="font-mono text-foreground/60 text-xs uppercase tracking-wider">
											TOKEN::SYMBOL
										</FormLabel>
										<FormControl>
											<Input
												placeholder="[TICKER]"
												className="font-mono focus:border-primary/50"
												{...field}
											/>
										</FormControl>
										<FormMessage className="font-mono text-xs" />
									</FormItem>
								)}
							/>
						</div>
					</div>

					{/* Description */}
					<FormField
						control={form.control}
						name="description"
						render={({ field }) => (
							<FormItem>
								<div className="flex items-center justify-between">
									<FormLabel className="font-mono text-foreground/60 text-xs uppercase tracking-wider">
										PROJECT::DESCRIPTION
									</FormLabel>
									<span
										className={cn(
											"font-mono text-xs",
											description.length > 256
												? "text-destructive"
												: description.length > 230
													? "text-warning"
													: "text-muted-foreground"
										)}
									>
										{description.length}/256
									</span>
								</div>
								<FormControl>
									<Textarea
										placeholder="[DESCRIBE_YOUR_TOKEN_PROJECT]"
										className="min-h-[100px] resize-none font-mono text-sm focus:border-primary/50"
										maxLength={256}
										{...field}
									/>
								</FormControl>
								<FormMessage className="font-mono text-xs" />
							</FormItem>
						)}
					/>

					{/* Social Links */}
					<div className="space-y-4">
						<p className="font-mono text-muted-foreground text-xs uppercase">SOCIAL::LINKS</p>
						<div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
							<FormField
								control={form.control}
								name="website"
								render={({ field }) => (
									<FormItem>
										<FormLabel className="font-mono text-foreground/60 text-xs uppercase tracking-wider">
											WEBSITE <span className="text-muted-foreground/40">(OPTIONAL)</span>
										</FormLabel>
										<FormControl>
											<Input
												placeholder="https://[DOMAIN]"
												className="font-mono text-sm focus:border-primary/50"
												{...field}
											/>
										</FormControl>
										<FormMessage className="font-mono text-xs" />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="telegram"
								render={({ field }) => (
									<FormItem>
										<FormLabel className="font-mono text-foreground/60 text-xs uppercase tracking-wider">
											TELEGRAM <span className="text-muted-foreground/40">(OPTIONAL)</span>
										</FormLabel>
										<FormControl>
											<Input
												placeholder="https://t.me/[GROUP]"
												className="font-mono text-sm focus:border-primary/50"
												{...field}
											/>
										</FormControl>
										<FormMessage className="font-mono text-xs" />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="twitter"
								render={({ field }) => (
									<FormItem>
										<FormLabel className="font-mono text-foreground/60 text-xs uppercase tracking-wider">
											X <span className="text-muted-foreground/40">(OPTIONAL)</span>
										</FormLabel>
										<FormControl>
											<Input
												placeholder="https://x.com/[HANDLE]"
												className="font-mono text-sm focus:border-primary/50"
												{...field}
											/>
										</FormControl>
										<FormMessage className="font-mono text-xs" />
									</FormItem>
								)}
							/>
						</div>
					</div>

					{/* Dev Buy Amount */}
					<FormField
						control={form.control}
						name="devBuyAmount"
						render={({ field }) => (
							<FormItem className="rounded-lg border-2 border-dashed bg-background/50 p-4">
								<div className="space-y-3">
									<div className="flex items-center justify-between">
										<FormLabel className="flex items-center gap-2 font-mono text-sm uppercase tracking-wider">
											<Wallet className="h-4 w-4 text-primary" />
											DEV BUY AMOUNT
										</FormLabel>
										{balance && (
											<span className="font-mono text-muted-foreground text-xs">
												BALANCE: {balance} SUI
											</span>
										)}
									</div>
									<FormControl>
										<div className="relative">
											<Input
												placeholder="0.00"
												className="pr-12 font-mono text-sm focus:border-primary/50"
												type="number"
												step="0.01"
												min="0"
												{...field}
											/>
											<span className="-translate-y-1/2 absolute top-1/2 right-3 font-mono text-muted-foreground text-sm">
												SUI
											</span>
										</div>
									</FormControl>
									<FormDescription className="font-mono text-muted-foreground text-xs uppercase">
										AMOUNT_OF_SUI_FOR_INITIAL_BUY
									</FormDescription>
									{devBuyAmount && balance && Number(devBuyAmount) > Number(balance) && (
										<p className="font-mono text-destructive text-xs uppercase">INSUFFICIENT::BALANCE</p>
									)}
									<FormMessage className="font-mono text-xs" />
								</div>
							</FormItem>
						)}
					/>

					{/* Burn Tax */}
					<FormField
						control={form.control}
						name="burnTax"
						render={({ field }) => (
							<FormItem className="rounded-lg border-2 border-dashed bg-background/50 p-4">
								<div className="space-y-3">
									<FormLabel className="flex items-center gap-2 font-mono text-sm uppercase tracking-wider">
										🔥 BURN TAX (optional)
									</FormLabel>
									<FormControl>
										<div className="relative">
											<Input
												placeholder="0"
												className="pr-12 font-mono text-sm focus:border-primary/50"
												type="number"
												step="0.1"
												min="0"
												max="60"
												{...field}
											/>
											<span className="-translate-y-1/2 absolute top-1/2 right-3 font-mono text-muted-foreground text-sm">
												%
											</span>
										</div>
									</FormControl>
									<FormDescription className="font-mono text-muted-foreground text-xs uppercase">
										The burn/sell tax is progressive: it starts at 0% and increases up to the max %
										chosen by the creator, depending on how close the pool is to full bonding.
									</FormDescription>
									<FormMessage className="font-mono text-xs" />
								</div>
							</FormItem>
						)}
					/>

					{/* Hide Identity */}
					<FormField
						control={form.control}
						name="hideIdentity"
						render={({ field }) => (
							<FormItem
								className={cn(
									"relative rounded-lg border-2 border-dashed p-4 transition-all duration-200",
									field.value
										? "border-destructive/60 bg-destructive/5"
										: "border-muted-foreground/30 bg-background/50 hover:border-destructive/40"
								)}
							>
								<div className="flex items-center justify-between">
									<div className="flex items-center gap-3">
										<div
											className={cn(
												"rounded-md p-2 transition-colors",
												field.value ? "bg-destructive/10" : "bg-muted"
											)}
										>
											<UserX
												className={cn(
													"h-5 w-5",
													field.value ? "animate-pulse text-destructive" : "text-muted-foreground"
												)}
											/>
										</div>

										<div className="space-y-1">
											<FormLabel className="cursor-pointer font-mono text-foreground/80 text-sm uppercase tracking-wider">
												HIDE::CREATOR::IDENTITY
											</FormLabel>
											<p className="font-mono text-muted-foreground text-xs uppercase">
												{field.value ? "IDENTITY::HIDDEN" : "X_HANDLE_WILL_BE_[REDACTED]"}
											</p>
										</div>
									</div>

									<FormControl>
										<Switch
											checked={field.value}
											onCheckedChange={field.onChange}
											className="data-[state=checked]:bg-destructive"
										/>
									</FormControl>
								</div>
							</FormItem>
						)}
					/>

					{/* Sniper Protection Toggle */}
					<FormField
						control={form.control}
						name="sniperProtection"
						render={({ field }) => (
							<FormItem
								className={cn(
									"relative rounded-lg border-2 border-dashed p-4 transition-all duration-200",
									field.value
										? "border-primary/60 bg-primary/5"
										: "border-muted-foreground/30 bg-background/50 hover:border-primary/40"
								)}
							>
								<div className="flex items-center justify-between">
									<div className="flex items-center gap-3">
										<div
											className={cn(
												"rounded-md p-2 transition-colors",
												field.value ? "bg-primary/10" : "bg-muted"
											)}
										>
											{field.value ? (
												<ShieldCheck className="h-5 w-5 animate-pulse text-primary" />
											) : (
												<Shield className="h-5 w-5 text-muted-foreground" />
											)}
										</div>

										<div className="space-y-1">
											<FormLabel className="cursor-pointer font-mono text-foreground/80 text-sm uppercase tracking-wider">
												SNIPER::PROTECTION
											</FormLabel>
											<p className="font-mono text-muted-foreground text-xs uppercase">
												{field.value
													? "PROTECTION::ENABLED"
													: "ENABLE_SNIPER_PROTECTION_FOR_THIS_TOKEN"}
											</p>
										</div>
									</div>

									<FormControl>
										<Switch
											checked={field.value}
											onCheckedChange={(checked) => {
												field.onChange(checked)
												setShowProtectionSettings(checked)
											}}
											className="data-[state=checked]:bg-primary"
										/>
									</FormControl>
								</div>
							</FormItem>
						)}
					/>

					{/* Protection Settings - Only show when sniper protection is enabled */}
					<Collapsible open={showProtectionSettings && sniperProtection} onOpenChange={setShowProtectionSettings}>
						<CollapsibleContent className="mt-4 space-y-4">
							<div className="space-y-4 rounded-lg border-2 border-primary/20 border-dashed bg-primary/5 p-4">
								<p className="mb-3 font-mono text-muted-foreground text-xs uppercase">
									OPTIONAL::PROTECTION::SETTINGS
								</p>

								{/* Twitter Auth */}
								<FormField
									control={form.control}
									name="requireTwitter"
									render={({ field }) => (
										<FormItem className="flex flex-row items-center justify-between rounded-lg border bg-background/50 p-4">
											<div className="space-y-1">
												<FormLabel className="flex items-center gap-2 font-mono text-sm uppercase tracking-wider">
													<Twitter className="h-4 w-4 text-primary" />
													REQUIRE X LOGIN
												</FormLabel>
												<FormDescription className="font-mono text-muted-foreground text-xs uppercase">
													BUYERS_MUST_CONNECT_X_ACCOUNT
												</FormDescription>
											</div>
											<FormControl>
												<Switch checked={field.value} onCheckedChange={field.onChange} />
											</FormControl>
										</FormItem>
									)}
								/>

								{/* Reveal Trader Identity - Same level as Twitter auth */}
								<FormField
									control={form.control}
									name="revealTraderIdentity"
									render={({ field }) => (
										<FormItem className="flex flex-row items-center justify-between rounded-lg border bg-background/50 p-4">
											<div className="space-y-1">
												<FormLabel className="flex items-center gap-2 font-mono text-sm uppercase tracking-wider">
													<UserX className="h-4 w-4 text-primary" />
													REVEAL TRADER X IDENTITY
												</FormLabel>
												<FormDescription className="font-mono text-muted-foreground text-xs uppercase">
													SHOW_X_USERNAME_IN_TRADING_HISTORY
												</FormDescription>
											</div>
											<FormControl>
												<Switch
													checked={field.value}
													onCheckedChange={(checked) => {
														field.onChange(checked)
														// If revealing identity, also enable X login requirement
														if (checked) {
															form.setValue("requireTwitter", true)
														}
													}}
												/>
											</FormControl>
										</FormItem>
									)}
								/>

								{/* Minimum Follower Count */}
								<FormField
									control={form.control}
									name="minFollowerCount"
									render={({ field }) => (
										<FormItem className="rounded-lg border bg-background/50 p-4">
											<FormLabel className="flex items-center gap-2 font-mono text-sm uppercase tracking-wider">
												<Users className="h-4 w-4 text-primary" />
												MIN X FOLLOWER COUNT (OPTIONAL)
											</FormLabel>
											<FormControl>
												<div className="relative">
													<Input
														placeholder="100"
														className="pr-24 font-mono text-sm focus:border-primary/50"
														type="number"
														step="1"
														min="0"
														{...field}
														onChange={(e) => {
															field.onChange(e)
															// If setting min follower count, also enable X login requirement
															if (e.target.value && Number(e.target.value) > 0) {
																form.setValue("requireTwitter", true)
															}
														}}
													/>
													<span className="-translate-y-1/2 absolute top-1/2 right-3 font-mono text-muted-foreground text-sm">
														followers
													</span>
												</div>
											</FormControl>
											<FormDescription className="font-mono text-muted-foreground text-xs uppercase">
												MINIMUM_FOLLOWERS_REQUIRED_TO_BUY
											</FormDescription>
											<FormMessage className="font-mono text-xs" />
										</FormItem>
									)}
								/>

								{/* Max Holding Percentage */}
								<FormField
									control={form.control}
									name="maxHoldingPercent"
									render={({ field }) => (
										<FormItem className="rounded-lg border bg-background/50 p-4">
											<FormLabel className="flex items-center gap-2 font-mono text-sm uppercase tracking-wider">
												<DollarSign className="h-4 w-4 text-primary" />
												MAX HOLDINGS % PER WALLET (OPTIONAL)
											</FormLabel>
											<FormControl>
												<div className="relative">
													<Input
														placeholder=""
														className="pr-12 font-mono text-sm focus:border-primary/50"
														type="number"
														step="0.1"
														min="0.1"
														max="100"
														{...field}
													/>
													<span className="-translate-y-1/2 absolute top-1/2 right-3 font-mono text-muted-foreground text-sm">
														%
													</span>
												</div>
											</FormControl>
											<FormDescription className="font-mono text-muted-foreground text-xs uppercase">
												MAX_PERCENTAGE_PER_WALLET (0.1%-100%)
											</FormDescription>
											<FormMessage className="font-mono text-xs" />
										</FormItem>
									)}
								/>
							</div>
						</CollapsibleContent>
					</Collapsible>

					<TokenCreationButton form={form} />
				</form>
			</Form>
		</div>
	)
}
