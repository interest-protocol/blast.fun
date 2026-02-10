import { Metadata } from "next"
import { constructMetadata } from "@/lib/metadata"
import { TokenModule } from "./_components/token-module"
import { fetchTokenByCoinType } from "@/lib/fetch-token-by-cointype"
import { formatNumberWithSuffix } from "@/utils/format"
import { redirect } from "next/navigation"
import { fetchTokenByPool } from "@/lib/fetch-token-by-pool"
import { BASE_DOMAIN } from "@/constants"

function decodeParam(raw: string): string {
	try {
		return decodeURIComponent(raw)
	} catch {
		return raw
	}
}

export async function generateMetadata({ params }: { params: Promise<{ coinType: string }> }): Promise<Metadata> {
	const { coinType: rawParam } = await params
	const param = decodeParam(rawParam)

	let tokenData: Awaited<ReturnType<typeof fetchTokenByCoinType>> = null
	if (param.includes("::")) {
		tokenData = await fetchTokenByCoinType(param)
	} else {
		const poolData = await fetchTokenByPool(param)
		tokenData = poolData ? await fetchTokenByCoinType(poolData.coinType) : null
	}
	if (!tokenData) {
		return constructMetadata({ title: "Unknown Token | BLAST.FUN" })
	}

	const symbol = tokenData.symbol || "UNKNOWN"
	const name = tokenData.name || symbol
	const marketCap = tokenData.marketCap || 0
	const formattedMcap = formatNumberWithSuffix(marketCap)

	const processedImageUrl = `${BASE_DOMAIN}/api/coin/${encodeURIComponent(tokenData.coinType)}/image`
	const ogParams: Record<string, string> = {
		name: name,
		ticker: symbol,
		marketCap: `$${formattedMcap}`,
		image: processedImageUrl
	}
	const ogImageUrl = `${BASE_DOMAIN}/api/og?${new URLSearchParams(ogParams).toString()}`

	return constructMetadata({
		title: `${symbol} $${formattedMcap}`,
		description: `Trade ${name} (${symbol}) on BLAST.FUN`,
		image: ogImageUrl,
	})
}

export default async function TokenPage({
	params,
	searchParams,
}: {
	params: Promise<{ coinType: string }>
	searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
	const { coinType: rawParam } = await params
	const param = decodeParam(rawParam)

	if (!param.includes("::")) {
		const poolData = await fetchTokenByPool(param)
		if (poolData) {
			return redirect(`/token/${encodeURIComponent(poolData.coinType)}`)
		}
		return (
			<div className="container mx-auto px-4 py-8">
				<div className="text-center">
					<h1 className="font-mono font-semibold text-muted-foreground text-xl uppercase">TOKEN_NOT_FOUND</h1>
					<p className="mt-2 font-mono text-muted-foreground/60 text-xs uppercase">{param || "[UNKNOWN]"}</p>
				</div>
			</div>
		)
	}

	const search = await searchParams
	const referral = search?.ref as string | undefined
	const tokenData = await fetchTokenByCoinType(param)
	if (!tokenData) {
		return (
			<div className="container mx-auto px-4 py-8">
				<div className="text-center">
					<h1 className="font-mono font-semibold text-muted-foreground text-xl uppercase">TOKEN_NOT_FOUND</h1>
					<p className="mt-2 font-mono text-muted-foreground/60 text-xs uppercase">{param || "[UNKNOWN]"}</p>
				</div>
			</div>
		)
	}

	return <TokenModule pool={tokenData} referral={referral} />
}