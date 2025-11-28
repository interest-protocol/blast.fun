"use client"

import { FC, useEffect, useState } from "react"
import { useApp } from "@/context/app.context"
import { fetchPortfolio } from "@/lib/fetch-portfolio"
import type { PortfolioResponse } from "@/types/portfolio"
import { Loader2, Gift } from "lucide-react"
import { Button } from "@/components/ui/button"
import { RewardsDialog } from "@/components/dialogs/rewards.dialog"
import { Logo } from "@/components/ui/logo"
import { PortfolioTable } from "../portfolio-table"
import { PortfolioStats } from "../portfolio-stats"
import LoadingPortfolio from "./_components/loading-portfolio"
import { ErrorPortfolio } from "./_components/error-portfolio"
import { Em } from "@stylin.js/elements"
import EmptyPortfolio from "./_components/empty-porfolio"

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

    if (isLoading && !portfolio) return <LoadingPortfolio />
    if (error) return <ErrorPortfolio error={error} />

    return (
        <div className="container max-w-6xl mx-auto px-4 py-8">
            <div className="space-y-6">
                <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="font-hegarty text-2xl uppercase tracking-wider">
                                PORTFOLIO
                            </h1>
                            <p className="font-mono text-sm text-muted-foreground mt-1">
                                Monitor your holdings and current performance.
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