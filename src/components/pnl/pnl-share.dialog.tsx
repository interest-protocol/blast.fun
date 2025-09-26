"use client"

import { useRef, useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
	ContextMenu,
	ContextMenuContent,
	ContextMenuItem,
	ContextMenuTrigger,
} from "@/components/ui/context-menu"
import { Loader2, Copy, Download, Upload, Trash2 } from "lucide-react"
import toast from "react-hot-toast"
import * as htmlToImage from "html-to-image"
import type { Token } from "@/types/token"
import { useUserHoldings } from "@/hooks/use-user-holdings"
import { formatNumberWithSuffix, formatSmallPrice } from "@/utils/format"
import {
	resizeImage,
	saveBackgroundToStorage,
	getBackgroundsFromStorage,
	deleteBackgroundFromStorage,
	DEFAULT_BACKGROUNDS,
	type BackgroundImage,
} from "./pnl.utils"

interface PnlDialogProps {
	isOpen: boolean
	onOpenChange: (open: boolean) => void
	pool: Token
	address?: string | null
}

export function PnlDialog({ isOpen, onOpenChange, pool, address }: PnlDialogProps) {
	const { data: pnlData, isLoading, error } = useUserHoldings(pool, address)
	const cardRef = useRef<HTMLDivElement>(null)
	const fileInputRef = useRef<HTMLInputElement>(null)

	const [selectedBackground, setSelectedBackground] = useState<string>(DEFAULT_BACKGROUNDS[0])
	const [customBackgrounds, setCustomBackgrounds] = useState<BackgroundImage[]>([])

	useEffect(() => {
		setCustomBackgrounds(getBackgroundsFromStorage())
	}, [])

	const symbol = pool.metadata?.symbol || "?"
	const name = pool.metadata?.name || "Unknown"
	const iconUrl = pool.metadata?.icon_url

	const isProfit = (pnlData?.pnl ?? 0) >= 0
	const pnlAmount = Math.abs(pnlData?.pnl ?? 0)
	const pnlPercentage = Math.abs(pnlData?.pnlPercentage ?? 0)

	const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0]
		if (!file) return

		try {
			const resizedImage = await resizeImage(file)
			const newBackground = saveBackgroundToStorage(resizedImage)
			setCustomBackgrounds([...customBackgrounds, newBackground])
			setSelectedBackground(newBackground.dataUrl)
		} catch (err: any) {
			toast.error(err?.message || "Failed to upload image")
		}

		if (fileInputRef.current) {
			fileInputRef.current.value = ""
		}
	}

	const handleDeleteBackground = (id: string) => {
		const bgToDelete = customBackgrounds.find(bg => bg.id === id)
		if (bgToDelete?.dataUrl === selectedBackground) {
			setSelectedBackground(DEFAULT_BACKGROUNDS[0])
		}

		deleteBackgroundFromStorage(id)
		setCustomBackgrounds(customBackgrounds.filter(bg => bg.id !== id))
	}

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
			if (err?.message?.includes('trim')) {
				toast.error("Image generation failed. Please try again.")
			} else {
				toast.error(err?.message || "Failed to download the image")
			}
		}
	}

	if (!isOpen) return null

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md" onClick={() => onOpenChange(false)}>
			<div className="relative" onClick={(e) => e.stopPropagation()}>
				{isLoading ? (
					<div className="flex items-center justify-center h-[200px] w-[400px] bg-background rounded-lg">
						<Loader2 className="h-8 w-8 animate-spin" />
					</div>
				) : error ? (
					<div className="text-center text-muted-foreground h-[200px] w-[400px] bg-background rounded-lg flex items-center justify-center">
						<div className="text-sm">{error.message || "Failed to load PNL data"}</div>
					</div>
				) : (
					<div className="flex flex-col items-center gap-2">
						<div
							ref={cardRef}
							className="relative overflow-hidden rounded-xl shadow-2xl"
							style={{
								width: "600px",
								height: "340px",
								backgroundColor: "#000000",
							}}
						>
							<img
								src={selectedBackground}
								alt=""
								className="absolute inset-0"
								style={{
									width: "100%",
									height: "100%",
									objectFit: "cover",
									objectPosition: "center center",
									pointerEvents: "none"
								}}
							/>

							<div className="absolute inset-0 bg-gradient-to-r from-background/70 via-background/50 to-transparent" />

							<div className="relative z-10 flex h-full w-full flex-col justify-between p-6">
								<div className="flex items-start gap-4">
									<div className="relative h-24 w-24 flex-shrink-0">
										{iconUrl ? (
											<img
												src={iconUrl}
												alt={symbol}
												className="h-24 w-24 rounded-full object-cover"
											/>
										) : (
											<div className="flex h-24 w-24 items-center justify-center rounded-full bg-muted">
												<span className="text-3xl font-bold">
													{symbol?.[0]?.toUpperCase() || '?'}
												</span>
											</div>
										)}
									</div>

									<div className="pt-1">
										<div className="text-base font-bold text-gray-300 mb-1">
											{name || 'Unknown'} ({symbol || '?'})
										</div>
										<div className={`text-4xl font-bold mb-1 ${isProfit ? 'text-green-500' : 'text-red-500'}`}>
											{isProfit ? '+' : '-'}${formatNumberWithSuffix(pnlAmount || 0)}
										</div>
										<div className={`text-xl font-semibold ${isProfit ? 'text-green-400' : 'text-red-400'}`}>
											{isProfit ? '↑' : '↓'} {(pnlPercentage || 0).toFixed(1)}%
										</div>
									</div>
								</div>

								<div className="flex flex-row gap-12">
									<div>
										<div className="text-muted-foreground uppercase text-xs tracking-wider mb-1">ENTRY</div>
										<div className="font-bold text-lg text-white">
											${pnlData?.entryPrice ? formatSmallPrice(pnlData.entryPrice) : '0.00'}
										</div>
									</div>
									<div>
										<div className="text-muted-foreground uppercase text-xs tracking-wider mb-1">SOLD</div>
										<div className="font-bold text-lg text-white">
											${pnlData?.sold ? formatNumberWithSuffix(pnlData.sold) : '0'}
										</div>
									</div>
									<div>
										<div className="text-muted-foreground uppercase text-xs tracking-wider mb-1">HOLDING</div>
										<div className="font-bold text-lg text-white">
											${pnlData?.holding ? formatNumberWithSuffix(pnlData.holding) : '0'}
										</div>
									</div>
								</div>
							</div>
						</div>

						<div className="flex flex-col gap-3 w-[600px]">
							<div className="flex items-start gap-2">
								<div
									className="flex-1 overflow-x-auto [&::-webkit-scrollbar]:hidden scroll-smooth"
									style={{
										scrollbarWidth: 'none',
										msOverflowStyle: 'none',
									}}
									onWheel={(e) => {
										const container = e.currentTarget
										if (container.scrollWidth > container.clientWidth) {
											e.preventDefault()
											container.scrollBy({
												left: e.deltaY,
												behavior: 'smooth'
											})
										}
									}}
								>
									<div className="flex gap-2 items-center">
										{DEFAULT_BACKGROUNDS.map((bg, idx) => (
											<button
												key={idx}
												onClick={() => setSelectedBackground(bg)}
												className={`relative h-16 w-16 rounded-lg overflow-visible border-2 transition-all flex-shrink-0 ${
													selectedBackground === bg ? 'border-primary' : 'border-border'
												}`}
											>
												<img
													src={bg}
													alt=""
													className="h-full w-full object-cover rounded-md"
												/>
											</button>
										))}

										{customBackgrounds.map((bg) => (
											<ContextMenu key={bg.id}>
												<ContextMenuTrigger asChild>
													<button
														onClick={() => setSelectedBackground(bg.dataUrl)}
														className={`relative h-16 w-16 rounded-lg overflow-hidden border-2 transition-all flex-shrink-0 ${
															selectedBackground === bg.dataUrl ? 'border-primary' : 'border-border'
														}`}
													>
														<img
															src={bg.dataUrl}
															alt=""
															className="h-full w-full object-cover"
														/>
													</button>
												</ContextMenuTrigger>
												<ContextMenuContent>
													<ContextMenuItem
														variant="destructive"
														onClick={() => handleDeleteBackground(bg.id)}
													>
														<Trash2 className="mr-2 h-4 w-4" />
														Remove Background
													</ContextMenuItem>
												</ContextMenuContent>
											</ContextMenu>
										))}
									</div>
								</div>

								<button
									onClick={() => fileInputRef.current?.click()}
									className="h-16 w-16 rounded-lg border-2 border-dashed border-border flex flex-col items-center justify-center hover:border-muted-foreground transition-colors gap-1 flex-shrink-0"
								>
									<Upload className="size-5 text-muted-foreground" />
									<span className="text-[9px] text-muted-foreground uppercase tracking-wide">MAX 1MB</span>
								</button>
							</div>

							<div className="flex gap-2">
								<Button
									onClick={handleDownload}
									variant="outline"
									size="sm"
									className="text-xs"
								>
									<Download className="h-3 w-3 mr-1" />
									Download
								</Button>
								<Button
									onClick={handleCopy}
									variant="outline"
									size="sm"
									className="text-xs"
								>
									<Copy className="h-3 w-3 mr-1" />
									Copy
								</Button>
							</div>
						</div>
					</div>
				)}

				<input
					ref={fileInputRef}
					type="file"
					accept="image/*"
					onChange={handleFileUpload}
					className="hidden"
				/>
			</div>
		</div>
	)
}