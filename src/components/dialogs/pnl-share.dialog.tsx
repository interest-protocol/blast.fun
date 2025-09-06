"use client"

import * as htmlToImage from "html-to-image"
import { Copy, Download, Loader2 } from "lucide-react"
import { useRef } from "react"
import toast from "react-hot-toast"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useUserHoldings } from "@/hooks/use-user-holdings"
import type { Token } from "@/types/token"
import { formatNumberWithSuffix, formatSmallPrice } from "@/utils/format"

interface PnlDialogProps {
	isOpen: boolean
	onOpenChange: (open: boolean) => void
	pool: Token
	address?: string | null
}

export function PnlDialog({ isOpen, onOpenChange, pool, address }: PnlDialogProps) {
	const { data: pnlData, isLoading, error } = useUserHoldings(pool, address)
	const cardRef = useRef<HTMLDivElement>(null)

	const symbol = pool.metadata?.symbol || "?"
	const name = pool.metadata?.name || "Unknown"
	const iconUrl = pool.metadata?.icon_url

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
				cacheBust: true,
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
			if (err?.message?.includes("trim")) {
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
				cacheBust: true,
			})

			if (!dataUrl) {
				toast.error("Failed to generate image")
				return
			}

			const link = document.createElement("a")
			link.download = `pnl-${symbol || "token"}.png`
			link.href = dataUrl
			link.click()

			toast.success("Successfully downloaded the image")
		} catch (err: any) {
			console.error("Failed to download:", err)
			// Better error message for debugging
			if (err?.message?.includes("trim")) {
				toast.error("Image generation failed. Please try again.")
			} else {
				toast.error(err?.message || "Failed to download the image")
			}
		}
	}

	return (
		<Dialog open={isOpen} onOpenChange={onOpenChange}>
			<DialogContent className="p-4 sm:max-w-[450px]">
				<DialogHeader>
					<DialogTitle className="font-mono uppercase">Share PNL</DialogTitle>
				</DialogHeader>

				<div className="flex flex-col items-center space-y-4">
					{isLoading ? (
						<div className="flex h-[200px] items-center justify-center">
							<Loader2 className="h-8 w-8 animate-spin" />
						</div>
					) : error ? (
						<div className="flex h-[200px] items-center justify-center text-center text-muted-foreground">
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
									position: "relative",
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
										pointerEvents: "none",
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
														<span className="font-bold text-xl">
															{symbol?.[0]?.toUpperCase() || "?"}
														</span>
													</div>
												)}
											</div>

											{/* Token Name and PNL */}
											<div>
												<div className="font-bold text-gray-300 text-sm">
													{name || "Unknown"} ({symbol || "?"})
												</div>
												<div
													className={`font-bold text-xl ${isProfit ? "text-green-500" : "text-red-500"}`}
												>
													{isProfit ? "+" : "-"}${formatNumberWithSuffix(pnlAmount || 0)}
												</div>
												<div
													className={`font-semibold text-sm ${isProfit ? "text-green-400" : "text-red-400"}`}
												>
													{isProfit ? "↑" : "↓"}
													{(pnlPercentage || 0).toFixed(1)}%
												</div>
											</div>
										</div>
									</div>

									{/* Bottom Stats */}
									<div className="flex flex-row gap-8 text-xs">
										<div>
											<div className="text-[10px] text-muted-foreground uppercase tracking-wider">
												entry
											</div>
											<div className="font-bold text-sm text-white">
												${pnlData?.entryPrice ? formatSmallPrice(pnlData.entryPrice) : "0.00"}
											</div>
										</div>
										<div>
											<div className="text-[10px] text-muted-foreground uppercase tracking-wider">
												sold
											</div>
											<div className="font-bold text-sm text-white">
												${pnlData?.sold ? formatNumberWithSuffix(pnlData.sold) : "0"}
											</div>
										</div>
										<div>
											<div className="text-[10px] text-muted-foreground uppercase tracking-wider">
												holding
											</div>
											<div className="font-bold text-sm text-white">
												${pnlData?.holding ? formatNumberWithSuffix(pnlData.holding) : "0"}
											</div>
										</div>
									</div>
								</div>
							</div>

							{/* Action Buttons */}
							<div className="flex w-full gap-2">
								<Button onClick={handleCopy} variant="outline" className="flex-1">
									<Copy className="mr-2 h-4 w-4" />
									Copy
								</Button>
								<Button onClick={handleDownload} variant="outline" className="flex-1">
									<Download className="mr-2 h-4 w-4" />
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
