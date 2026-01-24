"use client"

import { useState, useRef } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import TokenAvatar from "../tokens/token-avatar"
import { ChevronDown, Loader2 } from "lucide-react"
import type { WalletCoin } from "@/types/blockvision"

interface TokenSelectionDialogProps {
	coins: WalletCoin[]
	selectedCoin: string
	onSelectCoin: (coinType: string) => void
	isLoading?: boolean
	disabled?: boolean
}

export function TokenSelectionDialog({
	coins,
	selectedCoin,
	onSelectCoin,
	isLoading = false,
	disabled = false,
}: TokenSelectionDialogProps) {
	const [open, setOpen] = useState(false)
	const [searchQuery, setSearchQuery] = useState("")
	const searchInputRef = useRef<HTMLInputElement>(null)

	const selectedCoinInfo = coins.find(c => c.coinType === selectedCoin)

	const filteredCoins = coins.filter((coin) => {
		const query = searchQuery.toLowerCase()
		return (
			coin.symbol.toLowerCase().includes(query) ||
			coin.name.toLowerCase().includes(query)
		)
	})

	const handleSelect = (coinType: string) => {
		onSelectCoin(coinType)
		setOpen(false)
		setSearchQuery("")
	}

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button
					variant="outline"
					className="w-full justify-between h-auto py-3 px-4"
					disabled={disabled || isLoading}
				>
					{isLoading ? (
						<div className="flex items-center gap-2">
							<Loader2 className="h-4 w-4 animate-spin" />
							<span className="font-mono text-sm">LOADING TOKENS...</span>
						</div>
					) : selectedCoinInfo ? (
						<div className="flex items-center gap-3 flex-1">
							<TokenAvatar
								iconUrl={selectedCoinInfo.iconUrl}
								symbol={selectedCoinInfo.symbol}
								name={selectedCoinInfo.name}
								className="w-8 h-8 rounded"
							/>
							<div className="flex flex-col items-start">
								<span className="font-mono font-semibold">{selectedCoinInfo.symbol}</span>
								<span className="text-xs text-muted-foreground font-mono">
									Balance: {(parseFloat(selectedCoinInfo.balance) / Math.pow(10, selectedCoinInfo.decimals)).toFixed(2)}
								</span>
							</div>
						</div>
					) : (
						<span className="font-mono text-sm text-muted-foreground">SELECT TOKEN TO AIRDROP</span>
					)}
					<ChevronDown className="h-4 w-4 opacity-50" />
				</Button>
			</DialogTrigger>

			<DialogContent className="max-w-md">
				<DialogHeader>
					<DialogTitle className="font-mono uppercase tracking-wider">SELECT TOKEN</DialogTitle>
				</DialogHeader>

				<div className="space-y-4">
					<Input
						ref={searchInputRef}
						placeholder="SEARCH BY NAME OR SYMBOL"
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						className="font-mono text-xs uppercase placeholder:text-muted-foreground/60"
						autoFocus
					/>

					<div className="max-h-[400px] overflow-y-auto space-y-2">
						{filteredCoins.length === 0 ? (
							<div className="py-8 text-center">
								<p className="font-mono text-xs uppercase text-muted-foreground">
									NO TOKENS FOUND
								</p>
								<p className="font-mono text-xs uppercase text-muted-foreground/60 mt-1">
									TRY A DIFFERENT SEARCH
								</p>
							</div>
						) : (
							filteredCoins.map((coin) => (
								<Button
									key={coin.coinType}
									variant={coin.coinType === selectedCoin ? "secondary" : "ghost"}
									className="w-full justify-start h-auto py-3 px-4"
									onClick={() => handleSelect(coin.coinType)}
								>
									<div className="flex items-center gap-3 flex-1">
										<TokenAvatar
											iconUrl={coin.iconUrl}
											symbol={coin.symbol}
											name={coin.name}
											className="w-8 h-8 rounded"
										/>
										<div className="flex flex-col items-start flex-1">
											<span className="font-mono font-semibold">{coin.symbol}</span>
											<span className="text-xs text-muted-foreground font-mono">
												{coin.name}
											</span>
										</div>
										<div className="text-right">
											<span className="font-mono text-sm font-semibold">
												{(parseFloat(coin.balance) / Math.pow(10, coin.decimals)).toFixed(2)}
											</span>
										</div>
									</div>
								</Button>
							))
						)}
					</div>
				</div>
			</DialogContent>
		</Dialog>
	)
}
