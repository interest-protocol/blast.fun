"use client"

import { useState, useCallback, useEffect } from "react"
import { Edit2, Loader2, CheckCircle, Upload, X, Link2, Globe, MessageCircle, Twitter } from "lucide-react"
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { Token } from "@/types/token"
import { useApp } from "@/context/app.context"
import { useTransaction } from "@/hooks/sui/use-transaction"
import { pumpSdk } from "@/lib/pump"
import { coinWithBalance, Transaction } from "@mysten/sui/transactions"
import { getBase64ForMetadata } from "./metadata-image-utils"
import { cn } from "@/utils"

interface UpdateMetadataDialogProps {
	open: boolean
	onOpenChange: (open: boolean) => void
	pool: Token
}

export function UpdateMetadataDialog({ open, onOpenChange, pool }: UpdateMetadataDialogProps) {
	const metadata = pool.metadata
	
	// Form state - token metadata
	const [name, setName] = useState(metadata?.name || "")
	const [symbol, setSymbol] = useState(metadata?.symbol || "")
	const [description, setDescription] = useState(metadata?.description || "")
	const [iconUrl, setIconUrl] = useState(metadata?.icon_url || metadata?.icon_url || "")

	useEffect(() => {
		const fetchPoolMetadata = async () => {
			if (!pool.pool?.poolId || !pool.pool?.curve) return
			const targetPool = await pumpSdk.getPumpPool(pool.pool.poolId)
			const poolMetadata = await pumpSdk.getPoolMetadata({
				poolId: targetPool.objectId,
				quoteCoinType: targetPool.quoteCoinType,
				memeCoinType: pool.coinType,
				curveType: pool.pool.curve
			})
			console.log({poolMetadata})
		}
		fetchPoolMetadata()
	}, [metadata])
	
	// Form state - pool metadata (initialize with existing values)
	const [twitter, setTwitter] = useState(pool.metadata?.X || "")
	const [telegram, setTelegram] = useState(pool.metadata?.Telegram || "")
	const [website, setWebsite] = useState(pool.metadata?.Website || "")
	
	// Store original values to check for changes
	const originalTwitter = pool.metadata?.X || ""
	const originalTelegram = pool.metadata?.Telegram || ""
	const originalWebsite = pool.metadata?.Website || ""
	
	// Image input mode
	const [imageInputMode, setImageInputMode] = useState<"upload" | "url">("upload")
	const [imageUrlInput, setImageUrlInput] = useState(metadata?.icon_url || metadata?.icon_url || "")
	
	// UI state
	const [isProcessing, setIsProcessing] = useState(false)
	const [error, setError] = useState<string | null>(null)
	const [success, setSuccess] = useState<string | null>(null)
	const [isDragging, setIsDragging] = useState(false)
	const [uploadingImage, setUploadingImage] = useState(false)
	
	const { address } = useApp()
	const { executeTransaction } = useTransaction()
	
	// Handle image upload
	const handleImageUpload = useCallback(
		async (file: File) => {
			if (!file.type.startsWith("image/")) {
				setError("Please upload an image file (PNG, JPG, etc.)")
				return
			}
			
			setUploadingImage(true)
			setError(null)
			
			try {
				const base64 = await getBase64ForMetadata(file)
				setIconUrl(base64)
			} catch (error) {
				setError(error instanceof Error ? error.message : "Failed to upload image")
				console.error("Image upload error:", error)
			} finally {
				setUploadingImage(false)
			}
		},
		[]
	)
	
	// Handle drag and drop
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
	
	const handleUpdate = async () => {
		if (!address) {
			setError("Please connect your wallet")
			return
		}
		
		// Validate inputs
		if (!name.trim() || !symbol.trim()) {
			setError("Name and symbol are required")
			return
		}
		
		setIsProcessing(true)
		setError(null)
		
		try {
			const caps = await pumpSdk.getMetadataCaps({
				owner: address
			})
		
			const cap = caps.caps.find(c => c.coinType === pool.coinType)
			if (!cap) {
				setError("You do not have permission to update this token's metadata. Only the creator can update metadata.")
				setIsProcessing(false)
				return
			}
			
			let tx = new Transaction();
			let hasChanges = false;
			
			if (name !== metadata?.name) {
				const result = await pumpSdk.updateName({
					metadataCap: cap,
					value: name,
					tx
				})
				tx = result.tx
				hasChanges = true
			}
			
			if (symbol !== metadata?.symbol) {
				const result = await pumpSdk.updateSymbol({
					metadataCap: cap,
					value: symbol,
					tx
				})
				tx = result.tx
				hasChanges = true
			}

			if (description !== metadata?.description) {
				const result = await pumpSdk.updateDescription({
					metadataCap: cap,
					value: description,
					tx
				})
				tx = result.tx
				hasChanges = true
			}
			
			const finalIconUrl = imageInputMode === "url" ? imageUrlInput : iconUrl
			if (finalIconUrl !== metadata?.icon_url && finalIconUrl !== metadata?.icon_url) {
				const result = await pumpSdk.updateIconUrl({
					metadataCap: cap,
					value: finalIconUrl,
					tx
				})
				tx = result.tx
				hasChanges = true
			}
			
			// @dev: Update pool metadata social links only if changed
			const poolMetadataUpdates: { names: string[], values: string[] } = { names: [], values: [] }
			
			// Only update X/Twitter if it changed
			if (twitter !== originalTwitter) {
				poolMetadataUpdates.names.push('X')
				poolMetadataUpdates.values.push(twitter)
			}
			
			// Only update Telegram if it changed
			if (telegram !== originalTelegram) {
				poolMetadataUpdates.names.push('Telegram')
				poolMetadataUpdates.values.push(telegram)
			}
			
			// Only update Website if it changed
			if (website !== originalWebsite) {
				poolMetadataUpdates.names.push('Website')
				poolMetadataUpdates.values.push(website)
			}
			
			if (poolMetadataUpdates.names.length > 0) {
				// @dev: Convert names and values arrays into a Record object for the SDK
				const newMetadata: Record<string, string> = {}
				poolMetadataUpdates.names.forEach((name, index) => {
					newMetadata[name] = poolMetadataUpdates.values[index]
				})
				
				const result = await pumpSdk.updatePoolMetadata({
					pool: pool.pool?.poolId || "",
					newMetadata,
					metadataCap: cap.objectId,
					tx
				})
				tx = result.tx
				hasChanges = true
			}
			
			if (!hasChanges) {
				setError("No changes detected")
				setIsProcessing(false)
				return
			}

			if(process.env.NEXT_PUBLIC_FEE_ADDRESS) {
				// const feeInput = coinWithBalance({
				// 	balance: BigInt(5 * 10 ** 9),
				// 	type: "0x2::sui::SUI",
				// })(tx)
				// tx.transferObjects([feeInput], process.env.NEXT_PUBLIC_FEE_ADDRESS)
			}
			
			const result = await executeTransaction(tx)
			setSuccess(`Successfully updated metadata! Changes will be reflected in approximately 30 minutes.`)
			
			setTimeout(() => {
				onOpenChange(false)
				setSuccess(null)
				// Reload page to show updated metadata
				window.location.reload()
			}, 3000)
		} catch (err) {
			console.error("Update metadata error:", err)
			const errorMessage = err instanceof Error ? err.message : "Failed to update metadata"
			setError(errorMessage)
		} finally {
			setIsProcessing(false)
		}
	}
	
	// Reset states when dialog closes
	const handleOpenChange = (open: boolean) => {
		if (!open) {
			setError(null)
			setSuccess(null)
			// Reset form to original values
			setName(metadata?.name || "")
			setSymbol(metadata?.symbol || "")
			setDescription(metadata?.description || "")
			setIconUrl(metadata?.icon_url || metadata?.icon_url || "")
			setImageUrlInput(metadata?.icon_url || metadata?.icon_url || "")
			setTwitter(pool.metadata?.X || "")
			setTelegram(pool.metadata?.Telegram || "")
			setWebsite(pool.metadata?.Website || "")
		}
		onOpenChange(open)
	}
	
	return (
		<Dialog open={open} onOpenChange={handleOpenChange}>
			<DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						<Edit2 className="h-5 w-5 text-primary" />
						Update Token & Pool Metadata
					</DialogTitle>
					<DialogDescription>
						Update your token&apos;s name, symbol, description, icon, and social links. Only the token creator can make these changes. Making changes will take 5 Sui service fee.
					</DialogDescription>
				</DialogHeader>
				
				<div className="space-y-4">
					{/* Name Input */}
					<div className="space-y-2">
						<Label htmlFor="name">Name</Label>
						<Input
							id="name"
							type="text"
							placeholder="Token Name"
							value={name}
							onChange={(e) => setName(e.target.value)}
							disabled={isProcessing}
							className="font-mono"
						/>
					</div>
					
					{/* Symbol Input */}
					<div className="space-y-2">
						<Label htmlFor="symbol">Symbol</Label>
						<Input
							id="symbol"
							type="text"
							placeholder="TOKEN"
							value={symbol}
							onChange={(e) => setSymbol(e.target.value)}
							disabled={isProcessing}
							className="font-mono uppercase"
							maxLength={10}
						/>
					</div>
					
					{/* Description Input */}
					<div className="space-y-2">
						<Label htmlFor="description">Description</Label>
						<Textarea
							id="description"
							placeholder="Describe your token..."
							value={description}
							onChange={(e) => setDescription(e.target.value)}
							disabled={isProcessing}
							className="resize-none h-20"
							maxLength={500}
						/>
						<p className="text-xs text-muted-foreground">
							{description.length}/500 characters
						</p>
					</div>
					
					{/* Image Upload/URL */}
					<div className="space-y-2">
						<Label>Token Icon</Label>
						<Tabs value={imageInputMode} onValueChange={(v) => setImageInputMode(v as "upload" | "url")}>
							<TabsList className="grid w-full grid-cols-2">
								<TabsTrigger value="upload">Upload Image</TabsTrigger>
								<TabsTrigger value="url">Image URL</TabsTrigger>
							</TabsList>
							<TabsContent value="upload" className="mt-2">
								<div
									className={cn(
										"relative w-full h-32 border-2 border-dashed rounded-lg transition-all",
										isDragging ? "border-primary bg-primary/10" : "border-border hover:border-primary/50",
										uploadingImage && "opacity-50 pointer-events-none"
									)}
									onDrop={handleDrop}
									onDragOver={handleDragOver}
									onDragLeave={handleDragLeave}
								>
									{iconUrl ? (
										<div className="relative w-full h-full">
											{/* eslint-disable-next-line @next/next/no-img-element */}
											<img
												src={iconUrl}
												alt="Token icon"
												className="w-full h-full object-contain rounded-lg"
											/>
											<Button
												type="button"
												variant="destructive"
												size="icon"
												className="absolute top-2 right-2 h-6 w-6"
												onClick={() => setIconUrl("")}
												disabled={isProcessing || uploadingImage}
											>
												<X className="h-4 w-4" />
											</Button>
										</div>
									) : (
										<label className="flex flex-col items-center justify-center w-full h-full cursor-pointer">
											{uploadingImage ? (
												<Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
											) : (
												<>
													<Upload className="w-8 h-8 text-muted-foreground mb-2" />
													<span className="text-xs font-mono uppercase text-muted-foreground">
														Drop image or click to upload
													</span>
													<span className="text-xs text-muted-foreground mt-1">
														PNG, JPG (auto-compressed)
													</span>
												</>
											)}
											<input
												type="file"
												accept="image/*"
												className="hidden"
												onChange={(e) => {
													const file = e.target.files?.[0]
													if (file) handleImageUpload(file)
												}}
												disabled={isProcessing || uploadingImage}
											/>
										</label>
									)}
								</div>
							</TabsContent>
							<TabsContent value="url" className="mt-2">
								<div className="space-y-2">
									<Input
										type="url"
										placeholder="https://example.com/image.png"
										value={imageUrlInput}
										onChange={(e) => setImageUrlInput(e.target.value)}
										disabled={isProcessing}
									/>
									{imageUrlInput && (
										<div className="w-full h-24 border rounded-lg overflow-hidden">
											{/* eslint-disable-next-line @next/next/no-img-element */}
											<img
												src={imageUrlInput}
												alt="Token icon preview"
												className="w-full h-full object-contain"
												onError={(e) => {
													e.currentTarget.style.display = 'none'
												}}
											/>
										</div>
									)}
								</div>
							</TabsContent>
						</Tabs>
					</div>
					
					{/* Pool Metadata Section */}
					<div className="space-y-2 border-t pt-4">
						<div className="flex items-center justify-between">
							<Label className="text-sm font-semibold">Social Links (Pool Metadata)</Label>
							{(originalTwitter || originalTelegram || originalWebsite) && (
								<span className="text-xs text-muted-foreground">Existing values shown</span>
							)}
						</div>
						
						{/* Twitter/X */}
						<div className="space-y-2">
							<Label htmlFor="twitter" className="flex items-center gap-2">
								<span className="h-4 w-4 text-center font-bold">𝕏</span>
								X (Twitter)
								{originalTwitter && <span className="text-xs text-muted-foreground ml-auto">(Current)</span>}
							</Label>
							<Input
								id="twitter"
								type="url"
								placeholder="https://x.com/youraccount"
								value={twitter}
								onChange={(e) => setTwitter(e.target.value)}
								disabled={isProcessing}
							/>
						</div>
						
						{/* Telegram */}
						<div className="space-y-2">
							<Label htmlFor="telegram" className="flex items-center gap-2">
								<MessageCircle className="h-4 w-4" />
								Telegram
								{originalTelegram && <span className="text-xs text-muted-foreground ml-auto">(Current)</span>}
							</Label>
							<Input
								id="telegram"
								type="url"
								placeholder="https://t.me/yourchannel"
								value={telegram}
								onChange={(e) => setTelegram(e.target.value)}
								disabled={isProcessing}
							/>
						</div>
						
						{/* Website */}
						<div className="space-y-2">
							<Label htmlFor="website" className="flex items-center gap-2">
								<Globe className="h-4 w-4" />
								Website
								{originalWebsite && <span className="text-xs text-muted-foreground ml-auto">(Current)</span>}
							</Label>
							<Input
								id="website"
								type="url"
								placeholder="https://yourwebsite.com"
								value={website}
								onChange={(e) => setWebsite(e.target.value)}
								disabled={isProcessing}
							/>
						</div>
					</div>
					
					{/* Success Message */}
					{success && (
						<Alert className="border-green-500/50 bg-green-500/10">
							<CheckCircle className="h-4 w-4 text-green-500" />
							<AlertDescription className="text-xs text-green-500">
								{success}
							</AlertDescription>
						</Alert>
					)}
					
					{/* Error Message */}
					{error && (
						<Alert className="border-destructive/50 bg-destructive/10">
							<AlertDescription className="text-xs text-destructive">
								{error}
							</AlertDescription>
						</Alert>
					)}
					
					{/* Action Buttons */}
					<div className="flex gap-2">
						<Button
							variant="outline"
							onClick={() => onOpenChange(false)}
							disabled={isProcessing}
							className="flex-1"
						>
							Cancel
						</Button>
						<Button
							onClick={handleUpdate}
							disabled={isProcessing || (!name.trim() || !symbol.trim())}
							className="flex-1"
						>
							{isProcessing ? (
								<>
									<Loader2 className="h-4 w-4 animate-spin mr-2" />
									Updating...
								</>
							) : (
								<>
									<Edit2 className="h-4 w-4 mr-2" />
									Update Metadata
								</>
							)}
						</Button>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	)
}