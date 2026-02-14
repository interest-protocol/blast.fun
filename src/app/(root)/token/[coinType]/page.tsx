import { Metadata } from "next"
import { constructMetadata } from "@/lib/metadata"
import { TokenPageWrapper } from "./_components/token-page-wrapper"
import { fetchTokenByCoinType } from "@/lib/fetch-token-by-cointype"
import { formatNumberWithSuffix } from "@/utils/format"
import { redirect } from "next/navigation"
import { fetchTokenByPool } from "@/lib/fetch-token-by-pool"
import { BASE_DOMAIN } from "@/constants"
import type { Token } from "@/types/token"

function normalizeToken(t: Token | null): Token | null {
	if (!t) return null
	return {
		...t,
		id: t.id ?? "",
		poolId: t.poolId ?? "",
		coinType: t.coinType ?? "",
		treasuryCap: t.treasuryCap ?? "",
		isProtected: t.isProtected ?? false,
		metadata: {
			name: t.metadata?.name ?? "",
			symbol: t.metadata?.symbol ?? "???",
			description: t.metadata?.description ?? "",
			icon_url: t.metadata?.icon_url ?? "",
			decimals: t.metadata?.decimals ?? 9,
			supply: t.metadata?.supply ?? 0,
			Website: t.metadata?.Website,
			X: t.metadata?.X,
			Telegram: t.metadata?.Telegram,
			Discord: t.metadata?.Discord,
		},
		creator: {
			address: t.creator?.address ?? "",
			launchCount: t.creator?.launchCount ?? 0,
			trustedFollowers: String(t.creator?.trustedFollowers ?? "0"),
			followers: String(t.creator?.followers ?? "0"),
			twitterHandle: t.creator?.twitterHandle,
			twitterId: t.creator?.twitterId,
			hideIdentity: t.creator?.hideIdentity,
		},
		market: {
			marketCap: t.market?.marketCap ?? 0,
			holdersCount: t.market?.holdersCount ?? 0,
			volume24h: t.market?.volume24h ?? 0,
			liquidity: t.market?.liquidity ?? 0,
			price: t.market?.price ?? 0,
			coinPrice: t.market?.coinPrice ?? 0,
			bondingProgress: t.market?.bondingProgress ?? 0,
			circulating: t.market?.circulating,
			price5MinsAgo: t.market?.price5MinsAgo,
			price1HrAgo: t.market?.price1HrAgo,
			price4HrAgo: t.market?.price4HrAgo,
			price1DayAgo: t.market?.price1DayAgo,
		},
		pool: t.pool
			? {
					...t.pool,
					poolId: t.pool.poolId ?? "",
					coinType: t.pool.coinType ?? t.coinType,
					bondingCurve: t.pool.bondingCurve ?? 0,
					coinBalance: t.pool.coinBalance ?? "0",
					virtualLiquidity: t.pool.virtualLiquidity ?? "0",
					targetQuoteLiquidity: t.pool.targetQuoteLiquidity ?? "0",
					quoteBalance: t.pool.quoteBalance ?? "0",
					migrated: t.pool.migrated ?? false,
					curve: t.pool.curve ?? "",
					coinIpxTreasuryCap: t.pool.coinIpxTreasuryCap ?? "",
					canMigrate: t.pool.canMigrate ?? false,
					canonical: t.pool.canonical ?? false,
					migrationWitness: t.pool.migrationWitness ?? null,
				}
			: undefined,
		createdAt: typeof t.createdAt === "number" && !Number.isNaN(t.createdAt) ? t.createdAt : Date.now(),
		lastTradeAt: t.lastTradeAt ?? new Date().toISOString(),
		nsfw: t.nsfw ?? false,
	}
}

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

export default async function TokenPage({
	params,
	searchParams,
}: {
	params: Promise<{ coinType: string }>
	searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
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
	const pool = normalizeToken(tokenData)
	if (!pool) {
		return (
			<div className="container mx-auto px-4 py-8">
				<div className="text-center">
					<h1 className="font-mono font-semibold text-muted-foreground text-xl uppercase">TOKEN_NOT_FOUND</h1>
					<p className="mt-2 font-mono text-muted-foreground/60 text-xs uppercase">{coinType || "[UNKNOWN]"}</p>
				</div>
			</div>
		)
	}

	return <TokenPageWrapper pool={pool} referral={referral} />
}