"use client"

import { useState, useCallback } from "react"
import { Edit2, Loader2, CheckCircle, Upload, X } from "lucide-react"
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
import type { PoolWithMetadata } from "@/types/pool"
import { useApp } from "@/context/app.context"
import { useTransaction } from "@/hooks/sui/use-transaction"
import { pumpSdk } from "@/lib/pump"
import { Transaction } from "@mysten/sui/transactions"
import { getBase64ForMetadata } from "./metadata-image-utils"
import { cn } from "@/utils"

interface UpdateMetadataDialogProps {
	open: boolean
	onOpenChange: (open: boolean) => void
	pool: PoolWithMetadata
}

export function UpdateMetadataDialog({ open, onOpenChange, pool }: UpdateMetadataDialogProps) {
	const metadata = pool.coinMetadata || pool.metadata
	
	// Form state
	const [name, setName] = useState(metadata?.name || "")
	const [symbol, setSymbol] = useState(metadata?.symbol || "")
	const [description, setDescription] = useState(metadata?.description || "")
	const [iconUrl, setIconUrl] = useState(metadata?.iconUrl || metadata?.icon_url || "")
	
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
			console.log("Fetching metadata caps for address:", address)
			
			// Get metadata caps for the user
			const caps = await pumpSdk.getMetadataCaps({
				owner: address
			})
			
			console.log("Available caps:", caps)
			
			// Find the cap for this specific coin type
			const cap = caps.caps.find(c => c.coinType === pool.coinType)
			
			if (!cap) {
				setError("You do not have permission to update this token's metadata. Only the creator can update metadata.")
				setIsProcessing(false)
				return
			}
			
			console.log("Using cap:", cap)
			
			// Build transaction chain for all metadata updates
			let tx = new Transaction();
			
			// Update name if changed
			if (name !== metadata?.name) {
				const result = await pumpSdk.updateName({
					metadataCap: cap,
					value: name,
					tx
				})
				tx = result.tx
			}
			
			// Update symbol if changed
			if (symbol !== metadata?.symbol) {
				const result = await pumpSdk.updateSymbol({
					metadataCap: cap,
					value: symbol,
					tx
				})
				tx = result.tx
			}
			
			// Update description if changed
			if (description !== metadata?.description) {
				const result = await pumpSdk.updateDescription({
					metadataCap: cap,
					value: description,
					tx
				})
				tx = result.tx
			}
			
			// Update icon URL if changed
			if (iconUrl !== metadata?.iconUrl && iconUrl !== metadata?.icon_url) {
				const result = await pumpSdk.updateIconUrl({
					metadataCap: cap,
					value: iconUrl,
					tx
				})
				tx = result.tx
			}
			
			if (!tx) {
				setError("No changes detected")
				setIsProcessing(false)
				return
			}
			
			// Execute the transaction
			const result = await executeTransaction(tx)
			
			console.log("Transaction result:", result)
			
			// Show success message
			setSuccess(`Successfully updated metadata! Transaction: ${result.digest.slice(0, 8)}...`)
			
			// Close dialog after a delay to show success
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
			setIconUrl(metadata?.iconUrl || metadata?.icon_url || "")
		}
		onOpenChange(open)
	}
	
	return (
		<Dialog open={open} onOpenChange={handleOpenChange}>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						<Edit2 className="h-5 w-5 text-primary" />
						Update Token Metadata
					</DialogTitle>
					<DialogDescription>
						Update your token&apos;s name, symbol, description, and icon. Only the token creator can make these changes.
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
					
					{/* Image Upload */}
					<div className="space-y-2">
						<Label>Token Icon</Label>
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