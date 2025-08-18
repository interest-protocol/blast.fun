"use client"

import { useRef } from "react"
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Loader2, Copy, Download } from "lucide-react"
import toast from "react-hot-toast"
import * as htmlToImage from "html-to-image"
import type { PoolWithMetadata } from "@/types/pool"
import { useUserHoldings } from "@/hooks/use-user-holdings"
import { formatNumberWithSuffix, formatSmallPrice } from "@/utils/format"

interface PnlDialogProps {
	isOpen: boolean
	onOpenChange: (open: boolean) => void
	pool: PoolWithMetadata
	address?: string | null
}

export function PnlDialog({ isOpen, onOpenChange, pool, address }: PnlDialogProps) {
	const { data: pnlData, isLoading, error } = useUserHoldings(pool, address)
	const cardRef = useRef<HTMLDivElement>(null)

	const symbol = pool.coinMetadata?.symbol || "?"
	const name = pool.coinMetadata?.name || "Unknown"
	const iconUrl = pool.coinMetadata?.iconUrl

	const isProfit = (pnlData?.pnl ?? 0) >= 0
	const pnlAmount = Math.abs(pnlData?.pnl ?? 0)
	const pnlPercentage = Math.abs(pnlData?.pnlPercentage ?? 0)

	const handleCopy = async () => {
		if (!cardRef.current) {
			toast.error("Unable to capture the image")
			return
		}

		try {
			const blob = await htmlToImage.toBlob(cardRef.current, {
				quality: 1,
				pixelRatio: 2,
				cacheBust: true
			})

			if (!blob) {
				toast.error("Failed to generate image")
				return
			}

			const item = new ClipboardItem({ "image/png": blob })
			await navigator.clipboard.write([item])

			toast.success("Successfully copied the image")
		} catch (err: any) {
			console.error("Failed to copy:", err)
			// Better error message for debugging
			if (err?.message?.includes('trim')) {
				toast.error("Image generation failed. Please try again.")
			} else {
				toast.error(err?.message || "Failed to copy the image")
			}
		}
	}

	const handleDownload = async () => {
		if (!cardRef.current) {
			toast.error("Unable to capture the image")
			return
		}

		try {
			const dataUrl = await htmlToImage.toPng(cardRef.current, {
				quality: 1,
				pixelRatio: 2,
				cacheBust: true
			})

			if (!dataUrl) {
				toast.error("Failed to generate image")
				return
			}

			const link = document.createElement("a")
			link.download = `pnl-${symbol || 'token'}.png`
			link.href = dataUrl
			link.click()

			toast.success("Successfully downloaded the image")
		} catch (err: any) {
			console.error("Failed to download:", err)
			// Better error message for debugging
			if (err?.message?.includes('trim')) {
				toast.error("Image generation failed. Please try again.")
			} else {
				toast.error(err?.message || "Failed to download the image")
			}
		}
	}


	return (
		<Dialog open={isOpen} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-[450px] p-4">
				<DialogHeader>
					<DialogTitle className="font-mono uppercase">Share PNL</DialogTitle>
				</DialogHeader>

				<div className="flex flex-col items-center space-y-4">
					{isLoading ? (
						<div className="flex items-center justify-center h-[200px]">
							<Loader2 className="h-8 w-8 animate-spin" />
						</div>
					) : error ? (
						<div className="text-center text-muted-foreground h-[200px] flex items-center justify-center">
							<div className="text-sm">{error.message || "Failed to load PNL data"}</div>
						</div>
					) : (
						<>
							<div
								ref={cardRef}
								className="relative overflow-hidden rounded-lg"
								style={{
									width: "400px",
									height: "200px",
									maxWidth: "100%",
									backgroundColor: "#000000",
									position: "relative"
								}}
							>
								{/* Background Image */}
								<img
									src="/logo/share-bg.png"
									alt=""
									className="absolute inset-0"
									style={{
										width: "100%",
										height: "100%",
										objectFit: "cover",
										objectPosition: "center top",
										pointerEvents: "none"
									}}
								/>

								{/* Overlay for better text visibility */}
								<div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent" />

								<div className="relative z-10 flex h-full w-full flex-col justify-between p-4">
									<div className="flex items-start justify-between">
										<div className="flex items-start gap-3">
											{/* Token Icon */}
											<div className="relative h-14 w-14 flex-shrink-0">
												{iconUrl ? (
													<img
														src={iconUrl}
														alt={symbol}
														className="h-14 w-14 rounded-full object-cover"
													/>
												) : (
													<div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
														<span className="text-xl font-bold">
															{symbol?.[0]?.toUpperCase() || '?'}
														</span>
													</div>
												)}
											</div>

											{/* Token Name and PNL */}
											<div>
												<div className="text-sm font-bold text-gray-300">
													{name || 'Unknown'} ({symbol || '?'})
												</div>
												<div className={`text-xl font-bold ${isProfit ? 'text-green-500' : 'text-red-500'}`}>
													{isProfit ? '+' : '-'}${formatNumberWithSuffix(pnlAmount || 0)}
												</div>
												<div className={`text-sm font-semibold ${isProfit ? 'text-green-400' : 'text-red-400'}`}>
													{isProfit ? '↑' : '↓'}{(pnlPercentage || 0).toFixed(1)}%
												</div>
											</div>
										</div>
									</div>

									{/* Bottom Stats */}
									<div className="flex flex-row gap-8 text-xs">
										<div>
											<div className="text-muted-foreground uppercase text-[10px] tracking-wider">entry</div>
											<div className="font-bold text-sm">
												${pnlData?.entryPrice ? formatSmallPrice(pnlData.entryPrice) : '0.00'}
											</div>
										</div>
										<div>
											<div className="text-muted-foreground uppercase text-[10px] tracking-wider">sold</div>
											<div className="font-bold text-sm">
												${pnlData?.sold ? formatNumberWithSuffix(pnlData.sold) : '0'}
											</div>
										</div>
										<div>
											<div className="text-muted-foreground uppercase text-[10px] tracking-wider">holding</div>
											<div className="font-bold text-sm">
												${pnlData?.holding ? formatNumberWithSuffix(pnlData.holding) : '0'}
											</div>
										</div>
									</div>
								</div>
							</div>

							{/* Action Buttons */}
							<div className="flex gap-2 w-full">
								<Button
									onClick={handleCopy}
									variant="outline"
									className="flex-1"
								>
									<Copy className="h-4 w-4 mr-2" />
									Copy
								</Button>
								<Button
									onClick={handleDownload}
									variant="outline"
									className="flex-1"
								>
									<Download className="h-4 w-4 mr-2" />
									Download
								</Button>
							</div>
						</>
					)}
				</div>
			</DialogContent>
		</Dialog>
	)
}