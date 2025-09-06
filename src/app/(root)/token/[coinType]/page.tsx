import { Metadata } from "next"
import { constructMetadata } from "@/lib/metadata"
import { cacheDataUri } from "@/lib/image-cache"
import { TokenModule } from "./_components/token-module"
import { fetchTokenByCoinType } from "@/lib/fetch-token-by-cointype"
import { formatNumberWithSuffix } from "@/utils/format"
import { redirect } from "next/navigation"
import { fetchTokenByPool } from "@/lib/fetch-token-by-pool"

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
	
	// @dev: Get icon URL from metadata
	const iconUrl = tokenData.metadata?.icon_url || ""

	const baseUrl = process.env.NEXT_PUBLIC_VERCEL_URL 
		? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
		: 'http://localhost:3004'
	
	// @dev: Pass token data as parameters, only cache data URIs to avoid URL length issues
	let processedImageUrl = ''
	if (iconUrl) {
		if (iconUrl.startsWith('data:image/')) {
			// @dev: Only cache if it's a data URI that's not too large
			const cached = cacheDataUri(iconUrl)
			processedImageUrl = cached || ''
		} else {
			// @dev: Pass regular URLs directly
			processedImageUrl = iconUrl
		}
	}
	
	const ogParams: Record<string, string> = {
		name: name,
		marketCap: `$${formattedMcap}`,
	}
	
	// @dev: Only add image if we have one
	if (processedImageUrl) {
		ogParams.image = processedImageUrl
	}
	
	const ogImageUrl = `${baseUrl}/api/og?${new URLSearchParams(ogParams).toString()}`

	return constructMetadata({ 
		title: `${symbol} $${formattedMcap}`,
		description: `Trade ${name} (${symbol}) on BLAST.FUN - Market Cap: $${formattedMcap}`,
		image: ogImageUrl,
		openGraph: {
			title: `${name} (${symbol}) | BLAST.FUN`,
			description: `Trade ${name} on BLAST.FUN - Market Cap: $${formattedMcap}`,
			images: [{
				url: ogImageUrl,
				width: 1200,
				height: 630,
				alt: `${name} (${symbol})`,
				type: 'image/png'
			}],
		},
		twitter: {
			card: 'summary_large_image',
			title: `${name} (${symbol}) | BLAST.FUN`,
			description: `Trade ${name} on BLAST.FUN - Market Cap: $${formattedMcap}`,
			images: [ogImageUrl],
		}
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