"use client"

import { FC, useEffect, useState } from "react"
import { useApp } from "@/context/app.context"
import { fetchPortfolio } from "@/lib/fetch-portfolio"
import type { PortfolioResponse } from "@/types/portfolio"
import { RewardsDialog } from "@/components/dialogs/rewards.dialog"
import PortfolioTable from "./portfolio-table"
import PortfolioEmpty from "./portfolio-empty"
import PortfolioLoading from "./portfolio-loading"
import PortfolioHeader from "./portfolio-header"
import PortfolioWalletConnect from "./portfolio-wallet-connect"
import PortfolioError from "./portfolio-error"
import PortfolioStats from "./portfolio-stats"

const PortfolioContent:FC = () => {
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
			<PortfolioWalletConnect openDialog={() => setIsConnectDialogOpen(true)} />
		)
	}

	if (isLoading && !portfolio) {
		return (
			<PortfolioLoading />
		)
	}

	if (error) {
		return (
			<PortfolioError error={error} />
		)
	}

	return (
		<div className="container max-w-6xl mx-auto px-4 py-8">
			<div className="space-y-6">
				<PortfolioHeader claimRewards={() => setIsRewardsOpen(true)} />

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
					<PortfolioEmpty />
				)}
			</div>
			
			<RewardsDialog 
				open={isRewardsOpen} 
				onOpenChange={setIsRewardsOpen} 
			/>
		</div>
	)
}

export default PortfolioContent;
