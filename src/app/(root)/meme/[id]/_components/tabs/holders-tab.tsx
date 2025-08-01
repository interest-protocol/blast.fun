"use client"

import { PoolWithMetadata } from "@/types/pool"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Progress } from "@/components/ui/progress"
import { useHolders } from "@/hooks/use-holders"
import { Trophy, Users } from "lucide-react"
import { formatAddress } from "@mysten/sui/utils"
import { Logo } from "@/components/ui/logo"
import { formatAmountWithSuffix } from "@/utils/format"

interface HoldersTabProps {
	pool: PoolWithMetadata
}

export function HoldersTab({ pool }: HoldersTabProps) {
	const { data: holders = [], isLoading, error } = useHolders({
		coinType: pool.coinType,
		limit: 100,
	})

	if (isLoading) {
		return (
			<div className="p-4 space-y-3">
				{Array.from({ length: 10 }).map((_, i) => (
					<div
						key={i}
						className="h-20 bg-background/30 rounded-lg animate-pulse border border-border/30"
					/>
				))}
			</div>
		)
	}

	if (error) {
		return (
			<div className="p-8 text-center">
				<Logo className="w-12 h-12 mx-auto text-foreground/20 mb-4" />
				<p className="font-mono text-sm uppercase text-destructive">ERROR::LOADING::HOLDERS</p>
				<p className="font-mono text-xs uppercase text-muted-foreground/60 mt-2">DATA_UNAVAILABLE</p>
			</div>
		)
	}

	return (
		<ScrollArea className="h-[500px]">
			<div className="p-4">
				{holders.length === 0 ? (
					<div className="text-center py-12">
						<Users className="w-12 h-12 mx-auto text-foreground/20 mb-4" />
						<p className="font-mono text-sm uppercase text-muted-foreground">
							NO::HOLDERS::DETECTED
						</p>
						<p className="font-mono text-xs uppercase text-muted-foreground/60 mt-2">
							AWAITING_DISTRIBUTION
						</p>
					</div>
				) : (
					<div className="space-y-3">
						{/* Header */}
						<div className="grid grid-cols-5 gap-2 px-3 py-2 border-b border-border/50">
							<p className="font-mono text-xs uppercase text-muted-foreground">RANK</p>
							<p className="font-mono text-xs uppercase text-muted-foreground col-span-2">WALLET</p>
							<p className="font-mono text-xs uppercase text-muted-foreground text-right">AMOUNT</p>
							<p className="font-mono text-xs uppercase text-muted-foreground text-right">SHARE</p>
						</div>

						{/* Holders List */}
						{holders.map((holder, index) => {
							const isTopHolder = holder.rank <= 3
							const holderPercentage = holder.percentage

							return (
								<div
									key={holder.user}
									className="group relative border border-border/50 rounded-lg p-3 hover:border-primary/30 transition-all duration-300"
								>
									{/* Glow effect for top holders */}
									{isTopHolder && (
										<div className="absolute inset-0 bg-primary/10 opacity-50 group-hover:opacity-100 transition-opacity rounded-lg blur-xl" />
									)}

									<div className="relative">
										<div className="grid grid-cols-5 gap-2 items-center">
											{/* Rank */}
											<div className="flex items-center gap-2">
												{isTopHolder && (
													<Trophy className={`w-4 h-4 ${holder.rank === 1 ? 'text-yellow-500' :
														holder.rank === 2 ? 'text-gray-400' :
															'text-orange-600'
														}`} />
												)}
												<span className={`font-mono text-sm ${isTopHolder ? 'text-foreground' : 'text-muted-foreground'
													}`}>
													#{holder.rank}
												</span>
											</div>

											{/* Wallet */}
											<span className="font-mono text-xs text-foreground/80 col-span-2">
												{formatAddress(holder.user)}
											</span>

											{/* Amount */}
											<div className="text-right">
												<p className="font-mono text-sm text-foreground/80">
													{formatAmountWithSuffix(holder.balanceScaled)}
												</p>
												{holder.balanceUsd > 0 && (
													<p className="font-mono text-xs text-muted-foreground/60">
														${formatAmountWithSuffix(holder.balanceUsd)}
													</p>
												)}
											</div>

											{/* Share */}
											<div className="text-right">
												<p className="font-mono text-sm text-foreground/80">
													{holderPercentage.toFixed(2)}%
												</p>
											</div>
										</div>

										{/* Progress Bar */}
										<div className="mt-2 relative">
											<Progress
												value={holderPercentage}
												className="h-1.5 bg-background/50"
											/>
											<div
												className="absolute inset-0 h-1.5 bg-primary/20 blur-sm transition-all duration-500"
												style={{ width: `${holderPercentage}%` }}
											/>
										</div>
									</div>
								</div>
							)
						})}
					</div>
				)}
			</div>
		</ScrollArea>
	)
}