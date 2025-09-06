"use client"

import { Gift, Loader2 } from "lucide-react"
import { useEffect, useState } from "react"
import { RewardsDialog } from "@/components/dialogs/rewards.dialog"
import { Button } from "@/components/ui/button"
import { Logo } from "@/components/ui/logo"
import { useApp } from "@/context/app.context"
import { fetchPortfolio } from "@/lib/fetch-portfolio"
import type { PortfolioResponse } from "@/types/portfolio"
import { PortfolioStats } from "./portfolio-stats"
import { PortfolioTable } from "./portfolio-table"

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
			<div className="container mx-auto max-w-6xl px-4 py-8">
				<div className="flex min-h-[60vh] flex-col items-center justify-center">
					<Logo className="mx-auto mb-4 h-12 w-12 text-foreground/20" />
					<p className="font-mono text-muted-foreground text-sm uppercase tracking-wider">WALLET NOT CONNECTED</p>
					<p className="mt-2 font-mono text-muted-foreground/60 text-xs uppercase">
						CONNECT YOUR WALLET TO VIEW PORTFOLIO
					</p>
					<Button
						onClick={() => setIsConnectDialogOpen(true)}
						className="mt-6 font-mono uppercase tracking-wider"
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
			<div className="container mx-auto max-w-6xl px-4 py-8">
				<div className="flex min-h-[60vh] flex-col items-center justify-center">
					<Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
					<p className="mt-4 font-mono text-muted-foreground text-sm uppercase tracking-wider">
						LOADING PORTFOLIO
					</p>
					<p className="mt-2 font-mono text-muted-foreground/60 text-xs uppercase">FETCHING YOUR HOLDINGS</p>
				</div>
			</div>
		)
	}

	if (error) {
		return (
			<div className="container mx-auto max-w-6xl px-4 py-8">
				<div className="flex min-h-[60vh] flex-col items-center justify-center">
					<Logo className="mx-auto mb-4 h-12 w-12 text-destructive/20" />
					<p className="font-mono text-destructive text-sm uppercase tracking-wider">ERROR LOADING PORTFOLIO</p>
					<p className="mt-2 font-mono text-muted-foreground/60 text-xs uppercase">{error}</p>
				</div>
			</div>
		)
	}

	return (
		<div className="container mx-auto max-w-6xl px-4 py-8">
			<div className="space-y-6">
				<div className="flex flex-col gap-4">
					<div className="flex items-center justify-between">
						<div>
							<h1 className="font-bold font-mono text-2xl text-foreground/80 uppercase tracking-wider">
								PORTFOLIO TRACKER
							</h1>
							<p className="mt-1 font-mono text-muted-foreground/60 text-xs uppercase tracking-wider">
								MONITOR HOLDINGS AND PERFORMANCE
							</p>
						</div>
						<Button
							onClick={() => setIsRewardsOpen(true)}
							variant="outline"
							className="flex items-center gap-2 border-2 font-mono uppercase tracking-wider"
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
					<div className="flex flex-col items-center justify-center rounded-lg border-2 border-border/50 border-dashed bg-background/50 py-16 backdrop-blur-sm">
						<Logo className="mx-auto mb-4 h-12 w-12 text-foreground/20" />
						<p className="font-mono text-muted-foreground text-sm uppercase tracking-wider">
							NO HOLDINGS DETECTED
						</p>
						<p className="mt-2 font-mono text-muted-foreground/60 text-xs uppercase">
							START TRADING TO BUILD YOUR PORTFOLIO
						</p>
					</div>
				)}
			</div>

			<RewardsDialog open={isRewardsOpen} onOpenChange={setIsRewardsOpen} />
		</div>
	)
}
