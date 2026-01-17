
import { redirect } from "next/navigation";
import { fetchTokenByPool } from "@/lib/fetch-token-by-pool";
import { fetchTokenByCoinType } from "@/lib/fetch-token-by-cointype";
import { TokenModule } from "./coin-type/_components/token-module";

const Token = async ({
    params,
    searchParams,
}: {
    params: Promise<{ coinType: string }>
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) => {
    const { coinType } = await params
    if (!coinType.includes("::")) {
        const tokenData = await fetchTokenByPool(coinType)
        if (tokenData) {
            return redirect(`/token/${tokenData.coinType}`)
        }
    }
    const search = await searchParams
    const referral = search?.ref as string | undefined

    const tokenData = await fetchTokenByCoinType(coinType)
    if (!tokenData) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="text-center">
                    <h1 className="font-mono font-semibold text-muted-foreground text-xl uppercase">TOKEN_NOT_FOUND</h1>
                    <p className="mt-2 font-mono text-muted-foreground/60 text-xs uppercase">{coinType || "[UNKNOWN]"}</p>
                </div>
            </div>
        )
    }

    return <TokenModule pool={tokenData} referral={referral} />
}

export default Token;