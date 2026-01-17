import { Metadata } from "next";

import Token from "@/views/token";
import { BASE_DOMAIN } from "@/constants";
import { constructMetadata } from "@/lib/metadata";
import { formatNumberWithSuffix } from "@/utils/format";
import { fetchTokenByCoinType } from "@/lib/fetch-token-by-cointype";

export async function generateMetadata({ params }: { params: Promise<{ coinType: string }> }): Promise<Metadata> {
	const { coinType } = await params

	const tokenData = await fetchTokenByCoinType(coinType)
	if (!tokenData) {
		console.log("No token data found for:", coinType)
		return constructMetadata({ title: "Unknown Token | BLAST.FUN" })
	}

	const symbol = tokenData.metadata?.symbol || "UNKNOWN"
	const name = tokenData.metadata?.name || symbol
	const marketCap = tokenData.market?.marketCap || 0
	const formattedMcap = formatNumberWithSuffix(marketCap)

	const processedImageUrl = `https://blast.fun/api/coin/${coinType}/image`
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

const TokenPage = async ({
	params,
	searchParams,
}: {
	params: Promise<{ coinType: string }>
	searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) => <Token params={params} searchParams={searchParams} />

export default TokenPage;