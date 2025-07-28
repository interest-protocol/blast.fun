"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { MIST_PER_SUI } from "@mysten/sui/utils"
import { Upload, X, Shield, Users, DollarSign, ShieldCheck } from "lucide-react"
import { useCallback, useEffect, useState, useMemo } from "react"
import { useForm } from "react-hook-form"
import toast from "react-hot-toast"
import z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { HIDE_IDENTITY_SUI_FEE } from "@/constants/fees"
import { cn } from "@/utils"
import TokenCreationButton from "./create-token-button"
import { Logo } from "@/components/ui/logo"
import { getBase64 } from "../launch.utils"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Badge } from "@/components/ui/badge"

const tokenSchema = z.object({
	name: z.string().min(3, "Minimum 3 characters").max(20, "Maximum 20 characters"),
	symbol: z
		.string()
		.min(2, "Minimum 2 characters")
		.max(10, "Maximum 10 characters")
		.regex(/^[a-zA-Z][\x21-\x7E]*$/),
	description: z.string().min(10, "Minimum 10 characters").max(256, "Maximum 256 characters"),
	imageUrl: z.string().optional(),
	website: z.url("Invalid URL").optional().or(z.literal("")),
	telegram: z.url("Invalid URL").optional().or(z.literal("")),
	twitter: z.url("Invalid URL").optional().or(z.literal("")),
	hideIdentity: z.boolean(),
	requireTwitter: z.boolean(),
	maxHoldingPercent: z.string().optional().refine(
		(val) => !val || (Number(val) >= 0 && Number(val) <= 100),
		"Must be between 0 and 100"
	),
})

export type TokenFormValues = z.infer<typeof tokenSchema>

interface CreateTokenFormProps {
	onFormChange?: (values: Partial<TokenFormValues>) => void
}

export default function CreateTokenForm({ onFormChange }: CreateTokenFormProps) {
	const [isDragging, setIsDragging] = useState(false)
	const [showProtectionSettings, setShowProtectionSettings] = useState(false)

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
			requireTwitter: false,
			maxHoldingPercent: "",
		},
		mode: "onBlur",
	})

	const imageUrl = form.watch("imageUrl")
	const tokenName = form.watch("name")
	const tokenSymbol = form.watch("symbol")
	const hideIdentity = form.watch("hideIdentity")
	const requireTwitter = form.watch("requireTwitter")
	const maxHoldingPercent = form.watch("maxHoldingPercent")

	const hasProtectionSettings = requireTwitter || maxHoldingPercent

	const formData = useMemo(() => ({
		imageUrl,
		name: tokenName,
		symbol: tokenSymbol,
		hideIdentity,
		requireTwitter,
		maxHoldingPercent,
	}), [imageUrl, tokenName, tokenSymbol, hideIdentity, requireTwitter, maxHoldingPercent])

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

	return (
		<div className="w-full p-4 rounded-xl border-2 bg-background/50 backdrop-blur-sm shadow-2xl">
			<Form {...form}>
				<form className="space-y-6">
					<div className="flex gap-6">
						{/* Image Upload */}
						<FormField
							control={form.control}
							name="imageUrl"
							render={() => (
								<FormItem>
									<FormLabel className="font-mono text-xs uppercase tracking-wider text-foreground/60">
										IMAGE::UPLOAD
									</FormLabel>
									<FormControl>
										<div
											className={cn(
												"relative h-[120px] w-[120px] border-2 border-dashed rounded-lg ease-in-out duration-200 transition-all",
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
														className="w-full h-full object-cover rounded-lg"
													/>
													<Button
														type="button"
														variant="destructive"
														size="icon"
														className="absolute -top-2 -right-2 h-6 w-6 rounded-full shadow-lg"
														onClick={() => form.setValue("imageUrl", "")}
													>
														<X className="h-3 w-3" />
													</Button>
												</>
											) : (
												<label className="flex flex-col items-center justify-center w-full h-full cursor-pointer">
													<Upload className="w-8 h-8 text-foreground/20 mb-2" />
													<span className="text-xs font-mono uppercase text-foreground/40">
														DROP::IMAGE
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
										<FormLabel className="font-mono text-xs uppercase tracking-wider text-foreground/60">
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
										<FormLabel className="font-mono text-xs uppercase tracking-wider text-foreground/60">
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
								<FormLabel className="font-mono text-xs uppercase tracking-wider text-foreground/60">
									PROJECT::DESCRIPTION
								</FormLabel>
								<FormControl>
									<Textarea
										placeholder="[DESCRIBE_YOUR_TOKEN_PROJECT]"
										className="resize-none min-h-[100px] font-mono text-sm focus:border-primary/50"
										{...field}
									/>
								</FormControl>
								<FormMessage className="font-mono text-xs" />
							</FormItem>
						)}
					/>

					{/* Social Links */}
					<div className="space-y-4">
						<div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
							<FormField
								control={form.control}
								name="website"
								render={({ field }) => (
									<FormItem>
										<FormLabel className="font-mono text-xs uppercase tracking-wider text-foreground/60">
											WEBSITE
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
										<FormLabel className="font-mono text-xs uppercase tracking-wider text-foreground/60">
											TELEGRAM
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
										<FormLabel className="font-mono text-xs uppercase tracking-wider text-foreground/60">
											X
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

					{/* Hide Identity */}
					<FormField
						control={form.control}
						name="hideIdentity"
						render={({ field }) => (
							<FormItem className={cn(
								"relative overflow-hidden rounded-lg border-2 p-5 transition-all ease-in-out duration-300",
								field.value
									? "border-destructive/20 bg-destructive/10 shadow-[0_0_20px_rgba(239,68,68,0.3)]"
									: "border-destructive/5 bg-destructive/5 hover:border-destructive/10 hover:bg-destructive/10"
							)}>
								{/* animated background effect if active */}
								{field.value && (
									<div className="absolute inset-0 bg-gradient-to-r from-transparent via-destructive/10 to-transparent animate-pulse" />
								)}

								<div className="relative space-y-3">
									<div className="flex items-start justify-between">
										<div className="space-y-3">
											<div className="flex items-center gap-3">
												<Logo className="h-6 w-6 text-destructive animate-pulse" />
												<FormLabel className="font-mono text-base uppercase tracking-wider text-destructive cursor-pointer">
													HIDE::IDENTITY
												</FormLabel>

												<Badge className="text-xs font-mono uppercase border-destructive/50 bg-destructive/10 text-destructive">
													{Number(HIDE_IDENTITY_SUI_FEE) / Number(MIST_PER_SUI)} SUI
												</Badge>
											</div>

											<p className="font-mono text-sm uppercase text-muted-foreground">
												YOUR_TWITTER_WILL_BE_REDACTED
											</p>
										</div>

										<FormControl>
											<Switch
												checked={field.value}
												onCheckedChange={field.onChange}
												className="data-[state=checked]:bg-destructive"
											/>
										</FormControl>
									</div>
								</div>
							</FormItem>
						)}
					/>

					{/* Protection Settings */}
					<Collapsible open={showProtectionSettings} onOpenChange={setShowProtectionSettings}>
						<CollapsibleTrigger asChild>
							<Button
								type="button"
								variant="outline"
								className={cn(
									"w-full justify-between font-mono uppercase text-sm",
									"border-2 transition-all ease-in-out duration-300",
									hasProtectionSettings ? "border-primary/20 bg-primary/5" : "hover:border-primary/10"
								)}
							>
								<div className="flex items-center gap-2">
									{hasProtectionSettings ? <ShieldCheck className="h-4 w-4" /> : <Shield className="h-4 w-4 text-muted-foreground" />}
									<span>SNIPER::PROTECTION</span>
								</div>
								<span className="text-xs text-muted-foreground">
									{hasProtectionSettings ? "[ACTIVE]" : "[CONFIGURE]"}
								</span>
							</Button>
						</CollapsibleTrigger>
						<CollapsibleContent className="space-y-4 mt-4">
							<div className="rounded-lg border-2 border-dashed border-primary/20 p-4 space-y-4 bg-primary/5">
								{/* Twitter Auth */}
								<FormField
									control={form.control}
									name="requireTwitter"
									render={({ field }) => (
										<FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 bg-background/50">
											<div className="space-y-1">
												<FormLabel className="font-mono text-sm uppercase tracking-wider flex items-center gap-2">
													<Users className="h-4 w-4 text-primary" />
													REQUIRE::TWITTER
												</FormLabel>
												<FormDescription className="font-mono text-xs uppercase text-muted-foreground">
													BUYERS_MUST_CONNECT_TWITTER_ACCOUNT
												</FormDescription>
											</div>
											<FormControl>
												<Switch
													checked={field.value}
													onCheckedChange={field.onChange}
												/>
											</FormControl>
										</FormItem>
									)}
								/>

								{/* Max Holding Percentage */}
								<FormField
									control={form.control}
									name="maxHoldingPercent"
									render={({ field }) => (
										<FormItem className="rounded-lg border p-4 bg-background/50">
											<FormLabel className="font-mono text-sm uppercase tracking-wider flex items-center gap-2">
												<DollarSign className="h-4 w-4 text-primary" />
												MAX::HOLDINGS
											</FormLabel>
											<FormControl>
												<div className="relative">
													<Input
														placeholder="100"
														className="font-mono text-sm pr-12 focus:border-primary/50"
														type="number"
														step="1"
														min="0"
														max="100"
														{...field}
													/>
													<span className="absolute right-3 top-1/2 -translate-y-1/2 font-mono text-sm text-muted-foreground">
														%
													</span>
												</div>
											</FormControl>
											<FormDescription className="font-mono text-xs uppercase text-muted-foreground">
												MAX_PERCENTAGE_OF_HOLDING_PER_WALLET
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