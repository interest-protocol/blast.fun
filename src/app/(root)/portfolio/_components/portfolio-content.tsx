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
				<div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
					<h1 className="font-mono text-2xl font-bold uppercase tracking-wider text-foreground/80">
						Connect Wallet to View Portfolio
					</h1>
					<Button
						onClick={() => setIsConnectDialogOpen(true)}
						className="font-mono uppercase"
					>
						Connect Wallet
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
					<p className="mt-4 font-mono text-sm uppercase text-muted-foreground">
						Loading Portfolio...
					</p>
				</div>
			</div>
		)
	}

	if (error) {
		return (
			<div className="container max-w-6xl mx-auto px-4 py-8">
				<div className="flex flex-col items-center justify-center min-h-[60vh]">
					<p className="font-mono text-sm uppercase text-destructive">
						Error: {error}
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
							<h1 className="font-mono text-2xl font-bold uppercase tracking-wider text-foreground">
								Your Portfolio
							</h1>
							<p className="font-mono text-sm text-muted-foreground">
								Track your holdings and PNL across all tokens
							</p>
						</div>
						<Button
							onClick={() => setIsRewardsOpen(true)}
							variant="outline"
							className="font-mono uppercase flex items-center gap-2"
						>
							<Gift className="h-4 w-4" />
							Claim Referral Rewards
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
					<div className="flex flex-col items-center justify-center py-16 border border-border rounded-lg bg-card">
						<p className="font-mono text-sm uppercase text-muted-foreground">
							No holdings found
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