"use client"

import React, { useRef, useState } from "react"
import { Copy, Download, ExternalLink, Loader2, X } from "lucide-react"
import Image from "next/image"
import * as htmlToImage from "html-to-image"
import toast from "react-hot-toast"
import { TokenAvatar } from "@/components/tokens/token-avatar"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { formatNumberWithSuffix } from "@/utils/format"
import { cn } from "@/utils"

interface SwapSuccessDialogProps {
	open: boolean
	onOpenChange: (open: boolean) => void
	tradeType: "buy" | "sell"
	fromAmount: number
	toAmount: number
	fromToken: {
		symbol: string
		icon?: string
		name?: string
	}
	toToken: {
		symbol: string
		icon?: string
		name?: string
	}
	txHash?: string
}

export function SwapSuccessDialog({
	open,
	onOpenChange,
	fromAmount,
	toAmount,
	fromToken,
	toToken,
	txHash,
}: SwapSuccessDialogProps) {
	const contentRef = useRef<HTMLDivElement>(null)
	const [isCopying, setIsCopying] = useState(false)
	const [isSaving, setIsSaving] = useState(false)

	const handleViewOnSuiVision = () => {
		if (txHash) {
			window.open(`https://suivision.xyz/txblock/${txHash}`, "_blank")
		}
	}

	const handleCopy = async () => {
		if (!contentRef.current || isCopying) {
			toast.error("Unable to capture the image")
			return
		}

		setIsCopying(true)

		try {
			const blob = await htmlToImage.toBlob(contentRef.current, {
				quality: 1,
				pixelRatio: 2,
				cacheBust: true,
				backgroundColor: '#000000'
			})

			if (!blob) {
				toast.error("Failed to generate image")
				return
			}

			const item = new ClipboardItem({ "image/png": blob })
			await navigator.clipboard.write([item])

			toast.success("Successfully copied the image")
		} catch (err) {
			console.error("Failed to copy:", err)
			// Better error message for debugging
			const errorMessage = err instanceof Error ? err.message : "Unknown error"
			if (errorMessage.includes('trim')) {
				toast.error("Image generation failed. Please try again.")
			} else {
				toast.error(errorMessage || "Failed to copy the image")
			}
		} finally {
			setIsCopying(false)
		}
	}

	const handleSave = async () => {
		if (!contentRef.current || isSaving) {
			toast.error("Unable to capture the image")
			return
		}

		setIsSaving(true)

		try {
			const dataUrl = await htmlToImage.toPng(contentRef.current, {
				quality: 1,
				pixelRatio: 2,
				cacheBust: true,
				backgroundColor: '#000000'
			})

			if (!dataUrl) {
				toast.error("Failed to generate image")
				return
			}

			const link = document.createElement("a")
			link.download = `swap-success-${Date.now()}.png`
			link.href = dataUrl
			link.click()

			toast.success("Successfully downloaded the image")
		} catch (err) {
			console.error("Failed to download:", err)
			// Better error message for debugging
			const errorMessage = err instanceof Error ? err.message : "Unknown error"
			if (errorMessage.includes('trim')) {
				toast.error("Image generation failed. Please try again.")
			} else {
				toast.error(errorMessage || "Failed to download the image")
			}
		} finally {
			setIsSaving(false)
		}
	}

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent
				className="max-w-md bg-background/95 backdrop-blur-xl border-border/50"
				showCloseButton={false}
			>
				<DialogHeader className="text-center space-y-4">
					<div className="flex justify-between items-center">
						<DialogTitle className="text-lg font-bold uppercase tracking-wider">
							Success
						</DialogTitle>
						<button
							onClick={() => onOpenChange(false)}
							className="p-1 rounded-md hover:bg-muted/50 transition-colors"
						>
							<X className="h-4 w-4 text-muted-foreground" />
						</button>
					</div>
				</DialogHeader>

				{/* Content for screenshot */}
				<div
					ref={contentRef}
					className="flex flex-col items-center space-y-6 py-4 relative min-h-[400px]"
					style={{
						backgroundColor: '#000000',
						color: '#ffffff',
						position: 'relative'
					}}
				>
					{/* Background Image */}
					<div
						className="absolute inset-0 flex items-center justify-center"
						style={{ position: 'absolute', inset: 0 }}
					>
						<Image
							src="/logo/blast-helmet.jpg"
							alt="Blast Helmet"
							width={800}
							height={800}
							className="rounded-lg"
							unoptimized={true}
							style={{ borderRadius: '0.5rem' }}
						/>
					</div>

					{/* Content */}
					<div
						className="relative z-10 flex flex-col items-center justify-center h-full py-20"
						style={{ position: 'relative', zIndex: 10, color: '#ffffff' }}
					>
						{/* Token Exchange Display */}
						<div className="flex items-center gap-4 w-full justify-center">
							<div className="flex items-center gap-3">
								<div
									className="p-0.5 rounded-full"
									style={{
										padding: '2px',
										borderRadius: '9999px',
										backgroundColor: 'rgba(255, 255, 255, 0.1)'
									}}
								>
									<TokenAvatar
										iconUrl={fromToken.icon}
										symbol={fromToken.symbol}
										name={fromToken.name}
										className="w-10 h-10 rounded-full flex-shrink-0"
										enableHover={false}
									/>
								</div>
								<span
									className="font-mono text-lg"
									style={{ fontFamily: 'monospace', fontSize: '1.125rem', color: '#ffffff' }}
								>
									{formatNumberWithSuffix(fromAmount)} {fromToken.symbol}
								</span>
							</div>

							<span
								className="text-xl"
								style={{ fontSize: '1.25rem', color: 'rgba(255, 255, 255, 0.6)' }}
							>→</span>

							<div className="flex items-center gap-3">
								<div
									className="p-0.5 rounded-full"
									style={{
										padding: '2px',
										borderRadius: '9999px',
										backgroundColor: 'rgba(255, 255, 255, 0.1)'
									}}
								>
									<TokenAvatar
										iconUrl={toToken.icon}
										symbol={toToken.symbol}
										name={toToken.name}
										className="w-10 h-10 rounded-full flex-shrink-0"
										enableHover={false}
									/>
								</div>
								<span
									className="font-mono text-lg"
									style={{ fontFamily: 'monospace', fontSize: '1.125rem', color: '#ffffff' }}
								>
									{formatNumberWithSuffix(toAmount)} {toToken.symbol}
								</span>
							</div>
						</div>
					</div>
				</div>

				{/* Buttons - Outside screenshot area */}
				<div className="flex flex-col items-center space-y-3 mt-6">
					{/* Action Buttons Row */}
					<div className="flex gap-2 w-full max-w-xs">
						<Button
							variant="outline"
							className="flex-1 h-10 font-mono text-xs uppercase"
							onClick={handleCopy}
							disabled={isCopying || isSaving}
						>
							{isCopying ? (
								<>
									<Loader2 className="h-3.5 w-3.5 mr-2 animate-spin" />
									<span>Copying...</span>
								</>
							) : (
								<>
									<Copy className="h-3.5 w-3.5 mr-2" />
									<span>Copy</span>
								</>
							)}
						</Button>
						<Button
							variant="outline"
							className="flex-1 h-10 font-mono text-xs uppercase"
							onClick={handleSave}
							disabled={isCopying || isSaving}
						>
							{isSaving ? (
								<>
									<Loader2 className="h-3.5 w-3.5 mr-2 animate-spin" />
									<span>Saving...</span>
								</>
							) : (
								<>
									<Download className="h-3.5 w-3.5 mr-2" />
									<span>Save</span>
								</>
							)}
						</Button>
					</div>

					{/* View on Explorer Button */}
					{txHash && (
						<Button
							variant="outline"
							className="w-full max-w-xs h-10 font-mono text-xs uppercase"
							onClick={handleViewOnSuiVision}
						>
							<span>View on Explorer</span>
							<ExternalLink className="h-3.5 w-3.5 ml-2" />
						</Button>
					)}

					{/* Close Button */}
					<Button
							className={cn(
								"w-full max-w-xs h-12 font-mono text-sm uppercase",
								"bg-green-500/20 hover:bg-green-500/30 text-green-400 border border-green-500/50"
							)}
							onClick={() => onOpenChange(false)}
						>
							Close
						</Button>
				</div>
			</DialogContent>
		</Dialog>
	)
}