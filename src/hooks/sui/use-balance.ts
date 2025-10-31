import { useSuiClientQuery } from "@mysten/dapp-kit"
import { useApp } from "@/context/app.context"

export interface IUseTokenBalanceResponse {
    balance: string
    error: Error | null
    refetch: () => void
}

export const useBalance = (coinType?: string): IUseTokenBalanceResponse => {
    const { address } = useApp()

    const { data, error, refetch } = useSuiClientQuery(
        "getBalance",
        {
            owner: address || "",
            coinType: coinType,
        },
        {
            enabled: !!address && !!coinType,
        }
    )

    const balance = data?.totalBalance || "0"

    return {
        balance,
        error,
        refetch
    }
}
