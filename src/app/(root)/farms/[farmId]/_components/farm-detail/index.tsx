import { FC, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { useApp } from "@/context/app.context"
import { farmsSdk } from "@/lib/farms"
import type { InterestFarm, InterestAccount } from "@interest-protocol/farms"
import { interestProtocolApi, CoinMetadata } from "@/lib/interest-protocol-api"
import { FarmTerminal } from "../farm-terminal"
import { FarmDetailProps } from "./farm-detail.types"
import FarmInfo from "../farm-info"

const FarmDetail: FC<FarmDetailProps> = ({ farmId }) => {
    const router = useRouter()
    const { address, isConnected } = useApp()
    const [farm, setFarm] = useState<InterestFarm | null>(null)
    const [account, setAccount] = useState<InterestAccount | undefined>(undefined)
    const [metadata, setMetadata] = useState<CoinMetadata | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    const fetchFarmData = async () => {
        setIsLoading(true)
        try {
            const farmData = await farmsSdk.getFarm(farmId)
            setFarm(farmData)

            if (address && isConnected) {
                const allAccounts = await farmsSdk.getAccounts(address)
                const farmAccount = allAccounts.find((acc) => acc.farm === farmId)
                setAccount(farmAccount)
            }

            const meta = await interestProtocolApi.getCoinMetadata(farmData.stakeCoinType)
            setMetadata(meta)
        } catch (error) {
            console.error("Failed to fetch farm data:", error)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchFarmData()
    }, [farmId, address, isConnected])

    if (isLoading || !farm) {
        return (
            <div className="container max-w-7xl mx-auto px-3 md:px-4 py-4 md:py-8">
                <div className="flex items-center justify-center min-h-[60vh]">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
            </div>
        )
    }
    return (
        <div className="container max-w-7xl mx-auto px-3 md:px-4 py-4 md:py-8">
            <div className="space-y-4 md:space-y-6">
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.push("/farms")}
                        className="font-mono"
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back
                    </Button>
                </div>

                <div className="flex w-full flex-col gap-4 lg:flex-row lg:items-start lg:gap-6">
                    <div className="w-full lg:w-auto lg:min-w-[480px] border border-border/80 rounded-lg bg-card/50 shadow-md backdrop-blur-sm">
                        <FarmTerminal farm={farm} account={account} metadata={metadata} onOperationSuccess={fetchFarmData} />
                    </div>

                    <div className="w-full lg:flex-1">
                        <FarmInfo farm={farm} account={account} metadata={metadata} onOperationSuccess={fetchFarmData} />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default FarmDetail