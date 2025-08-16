import { Metadata } from "next"
import { constructMetadata } from "@/lib/metadata"
import { TokenModule } from "./_components/token-module"
import { fetchTokenData } from "@/lib/fetch-token-data"
import { formatNumberWithSuffix } from "@/utils/format"

export async function generateMetadata({
	params
}: {
	params: Promise<{ poolId: string }>
}): Promise<Metadata> {
	const { poolId } = await params

	const tokenData = await fetchTokenData(poolId)
	if (!tokenData) {
		return constructMetadata({ title: "Unknown Token | BLAST.FUN" })
	}

	const symbol = tokenData.coinMetadata?.symbol || tokenData.metadata?.symbol || "UNKNOWN"
	const marketCap = tokenData.marketData?.marketCap || 0
	const formattedMcap = formatNumberWithSuffix(marketCap)

	return constructMetadata({ title: `${symbol} $${formattedMcap}` })
}

export default async function TokenPage({
	params,
	searchParams
}: {
	params: Promise<{ poolId: string }>
	searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
	const { poolId } = await params
	const search = await searchParams
	const referral = search?.ref as string | undefined

	const tokenData = await fetchTokenData(poolId)
	if (!tokenData) {
		return (
			<div className="container mx-auto px-4 py-8">
				<div className="text-center">
					<h1 className="font-mono font-semibold text-xl uppercase text-muted-foreground">TOKEN_NOT_FOUND</h1>
					<p className="font-mono text-xs uppercase text-muted-foreground/60 mt-2">
						{poolId || "[UNKNOWN]"}
					</p>
				</div>
			</div>
		)
	}

	return <TokenModule pool={tokenData} referral={referral} />
}