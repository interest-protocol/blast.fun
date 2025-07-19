"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import z from "zod"
import { Upload, X, Skull } from "lucide-react"
import { useState, useCallback, useEffect } from "react"
import toast from "react-hot-toast"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Card, CardContent } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import TokenCreationButton from "./create-token-button"
import { cn, getBase64 } from "@/utils"
import { MIST_PER_SUI } from "@mysten/sui/utils"
import { HIDE_IDENTITY_SUI_FEE } from "@/constants/fees"

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
})

export type TokenFormValues = z.infer<typeof tokenSchema>

interface CreateTokenFormProps {
	onFormChange?: (values: Partial<TokenFormValues>) => void
}

export default function CreateTokenForm({ onFormChange }: CreateTokenFormProps) {
	const [isDragging, setIsDragging] = useState(false)

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
		},
		mode: "onBlur",
	})

	const imageUrl = form.watch("imageUrl")
	const tokenName = form.watch("name")
	const tokenSymbol = form.watch("symbol")
	const hideIdentity = form.watch("hideIdentity")

	useEffect(() => {
		if (onFormChange) {
			onFormChange({
				imageUrl,
				name: tokenName,
				symbol: tokenSymbol,
				hideIdentity,
			})
		}
	}, [imageUrl, tokenName, tokenSymbol, hideIdentity, onFormChange])

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
		<Card className="w-full border-2 bg-background/50 backdrop-blur-sm shadow-2xl">
			<CardContent className="pt-6">
				<Form {...form}>
					<form className="space-y-8">
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
													<label className="flex flex-col items-center justify-center w-full h-full">
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
							<p className="font-mono text-xs uppercase tracking-wider text-foreground/40">SOCIAL::LINKS</p>
							<div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
								<FormField
									control={form.control}
									name="website"
									render={({ field }) => (
										<FormItem>
											<FormLabel className="font-mono text-xs uppercase tracking-wider text-foreground/60">
												WEB
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

						{/* Identity */}
						<FormField
							control={form.control}
							name="hideIdentity"
							render={({ field }) => (
								<FormItem className="flex flex-row items-center justify-between rounded-lg border-2 p-4 bg-destructive/5">
									<div className="space-y-2">
										<div className="flex items-center gap-2">
											<Skull className="h-4 w-4 text-destructive" />
											<FormLabel className="font-mono text-sm uppercase tracking-wider">
												HIDE::IDENTITY
											</FormLabel>
										</div>
										<p className="font-mono text-xs uppercase text-foreground/60">
											PAY {Number(HIDE_IDENTITY_SUI_FEE) / Number(MIST_PER_SUI)} SUI TO REMAIN
											[ANONYMOUS]
										</p>
									</div>
									<FormControl>
										<Switch
											checked={field.value}
											onCheckedChange={field.onChange}
											className="data-[state=unchecked]:bg-muted data-[state=checked]:bg-destructive/20 dark:data-[state=checked]:bg-destructive"
										/>
									</FormControl>
								</FormItem>
							)}
						/>

						<TokenCreationButton form={form} />
					</form>
				</Form>
			</CardContent>
		</Card>
	)
}
