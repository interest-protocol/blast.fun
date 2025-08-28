"use client"

import { useEffect, useState } from "react"
import { useApp } from "@/context/app.context"
import { PortfolioTable } from "./portfolio-table"
import { PortfolioStats } from "./portfolio-stats"
import { fetchPortfolio } from "@/lib/fetch-portfolio"
import type { PortfolioResponse } from "@/types/portfolio"
import { Loader2, Gift } from "lucide-react"
import { Button } from "@/components/ui/button"
import { RewardsDialog } from "@/components/dialogs/rewards.dialog"
import { Logo } from "@/components/ui/logo"

export function PortfolioContent() {
	const { address, isConnected, setIsConnectDialogOpen } = useApp()
	const [portfolio, setPortfolio] = useState<PortfolioResponse | null>(null)
	const [isLoading, setIsLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)
	const [hideSmallBalance, setHideSmallBalance] = useState(true)
	const [isRewardsOpen, setIsRewardsOpen] = useState(false)

	useEffect(() => {
		if (!address) {
			setPortfolio(null)
			return
		}

		const loadPortfolio = async () => {
			setIsLoading(true)
			setError(null)
			try {
				const data = await fetchPortfolio(address)
				setPortfolio(data)
			} catch (err) {
				console.error("Failed to fetch portfolio:", err)
				setError(err instanceof Error ? err.message : "Failed to load portfolio")
			} finally {
				setIsLoading(false)
			}
		}

		loadPortfolio()
		const interval = setInterval(loadPortfolio, 30000)
		return () => clearInterval(interval)
	}, [address])

	if (!isConnected) {
		return (
			<div className="container max-w-6xl mx-auto px-4 py-8">
				<div className="flex flex-col items-center justify-center min-h-[60vh]">
					<Logo className="w-12 h-12 mx-auto mb-4 text-foreground/20" />
					<p className="font-mono text-sm uppercase tracking-wider text-muted-foreground">
						WALLET NOT CONNECTED
					</p>
					<p className="font-mono text-xs uppercase text-muted-foreground/60 mt-2">
						CONNECT YOUR WALLET TO VIEW PORTFOLIO
					</p>
					<Button
						onClick={() => setIsConnectDialogOpen(true)}
						className="font-mono uppercase tracking-wider mt-6"
						variant="outline"
					>
						CONNECT WALLET
					</Button>
				</div>
			</div>
		)
	}

	if (isLoading && !portfolio) {
		return (
			<div className="container max-w-6xl mx-auto px-4 py-8">
				<div className="flex flex-col items-center justify-center min-h-[60vh]">
					<Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
					<p className="mt-4 font-mono text-sm uppercase tracking-wider text-muted-foreground">
						LOADING PORTFOLIO
					</p>
					<p className="font-mono text-xs uppercase text-muted-foreground/60 mt-2">
						FETCHING YOUR HOLDINGS
					</p>
				</div>
			</div>
		)
	}

	if (error) {
		return (
			<div className="container max-w-6xl mx-auto px-4 py-8">
				<div className="flex flex-col items-center justify-center min-h-[60vh]">
					<Logo className="w-12 h-12 mx-auto mb-4 text-destructive/20" />
					<p className="font-mono text-sm uppercase tracking-wider text-destructive">
						ERROR LOADING PORTFOLIO
					</p>
					<p className="font-mono text-xs uppercase text-muted-foreground/60 mt-2">
						{error}
					</p>
				</div>
			</div>
		)
	}

	return (
		<div className="container max-w-6xl mx-auto px-4 py-8">
			<div className="space-y-6">
				<div className="flex flex-col gap-4">
					<div className="flex items-center justify-between">
						<div>
							<h1 className="font-mono text-2xl font-bold uppercase tracking-wider text-foreground/80">
								PORTFOLIO TRACKER
							</h1>
							<p className="font-mono text-xs uppercase tracking-wider text-muted-foreground/60 mt-1">
								MONITOR HOLDINGS AND PERFORMANCE
							</p>
						</div>
						<Button
							onClick={() => setIsRewardsOpen(true)}
							variant="outline"
							className="font-mono uppercase tracking-wider flex items-center gap-2 border-2"
						>
							<Gift className="h-4 w-4" />
							CLAIM REWARDS
						</Button>
					</div>
				</div>

				{portfolio && (
					<>
						<PortfolioStats portfolio={portfolio} />
						<PortfolioTable
							portfolio={portfolio}
							hideSmallBalance={hideSmallBalance}
							onHideSmallBalanceChange={setHideSmallBalance}
						/>
					</>
				)}

				{portfolio && portfolio.balances.length === 0 && (
					<div className="flex flex-col items-center justify-center py-16 border-2 border-dashed border-border/50 rounded-lg bg-background/50 backdrop-blur-sm">
						<Logo className="w-12 h-12 mx-auto mb-4 text-foreground/20" />
						<p className="font-mono text-sm uppercase tracking-wider text-muted-foreground">
							NO HOLDINGS DETECTED
						</p>
						<p className="font-mono text-xs uppercase text-muted-foreground/60 mt-2">
							START TRADING TO BUILD YOUR PORTFOLIO
						</p>
					</div>
				)}
			</div>
			
			<RewardsDialog 
				open={isRewardsOpen} 
				onOpenChange={setIsRewardsOpen} 
			/>
		</div>
	)
}