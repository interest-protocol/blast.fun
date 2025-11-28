"use client"

import { FC, useEffect, useState } from "react"
import { useApp } from "@/context/app.context"
import { fetchPortfolio } from "@/lib/fetch-portfolio"
import type { PortfolioResponse } from "@/types/portfolio"
import { RewardsDialog } from "@/components/dialogs/rewards.dialog"
import { PortfolioTable } from "../portfolio-table"
import { PortfolioStats } from "../portfolio-stats"
import LoadingPortfolio from "./_components/loading-portfolio"
import { ErrorPortfolio } from "./_components/error-portfolio"
import EmptyPortfolio from "./_components/empty-porfolio"
import ConnectWallet from "@/components/layout/connect-wallet"
import PortfolioContentHeader from "./_components/portfolio-content-header"

const PortfolioContent: FC = () => {
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

    if (!isConnected) return (
        <ConnectWallet
            onConnect={() => setIsConnectDialogOpen(true)}
            className="container max-w-6xl mx-auto px-3 md:px-4 py-4 md:py-8"
            subtitle="CONNECT YOUR WALLET TO VIEW PORTFOLIO"
        />
    )

    if (isLoading && !portfolio) return <LoadingPortfolio />
    if (error) return <ErrorPortfolio error={error} />

    return (
        <div className="container max-w-6xl mx-auto px-4 py-8">
            <div className="space-y-6">
               <PortfolioContentHeader onOpenRewards={() => setIsRewardsOpen(true)} />

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
                    <EmptyPortfolio />
                )}
            </div>

            <RewardsDialog
                open={isRewardsOpen}
                onOpenChange={setIsRewardsOpen}
            />
        </div>
    )
}

export default PortfolioContent