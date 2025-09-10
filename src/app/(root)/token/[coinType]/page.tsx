import { Metadata } from "next"
import { constructMetadata } from "@/lib/metadata"
import { TokenModule } from "./_components/token-module"
import { fetchTokenByCoinType } from "@/lib/fetch-token-by-cointype"
import { formatNumberWithSuffix } from "@/utils/format"
import { redirect } from "next/navigation"
import { fetchTokenByPool } from "@/lib/fetch-token-by-pool"
import { BASE_DOMAIN } from "@/constants"

export async function generateMetadata({
	params
}: {
	params: Promise<{ coinType: string }>
}): Promise<Metadata> {
	const { coinType } = await params

	const tokenData = await fetchTokenByCoinType(coinType)
	if (!tokenData) {
		return constructMetadata({ title: "Unknown Token | BLAST.FUN" })
	}

	const symbol = tokenData.metadata?.symbol || "UNKNOWN"
	const name = tokenData.metadata?.name || symbol
	const marketCap = tokenData.market?.marketCap || 0
	const formattedMcap = formatNumberWithSuffix(marketCap)
	
	const baseUrl = BASE_DOMAIN
	
	// @dev: Build OG image URL with coinType and name only
	const ogParams = new URLSearchParams({
		coinType: coinType,
		name: name
	})
	const ogImageUrl = `${baseUrl}/api/og?${ogParams.toString()}`
	
	return constructMetadata({
		title: `${symbol} $${formattedMcap}`,
		description: `Trade ${name} (${symbol}) on BLAST.FUN. Market Cap: $${formattedMcap}`,
		image: ogImageUrl
	})
}

export default async function TokenPage({
	params,
	searchParams
}: {
	params: Promise<{ coinType: string }>
	searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
	const { coinType } = await params
	if(!coinType.includes("::")) {
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
					<h1 className="font-mono font-semibold text-xl uppercase text-muted-foreground">TOKEN_NOT_FOUND</h1>
					<p className="font-mono text-xs uppercase text-muted-foreground/60 mt-2">
						{coinType || "[UNKNOWN]"}
					</p>
				</div>
			</div>
		)
	}

	return <TokenModule pool={tokenData} referral={referral} />
}