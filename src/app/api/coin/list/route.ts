import { NextResponse } from "next/server"
import { fetchNoodlesCoinList } from "@/lib/noodles/client"
import type { NoodlesCoinListParams, NoodlesCoinList } from "@/lib/noodles/client"

export const revalidate = 30

function isTestCoin(coin: NoodlesCoinList): boolean {
  const blocked = ["test", "meme coin", "taaaaa"]

  const name = coin.name.toLowerCase()
  const symbol = coin.symbol.toLowerCase()

  return blocked.some((word) =>
    name.includes(word) || symbol.includes(word)
  )
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)

    const p = (key: string) => searchParams.get(key)
    const pNum = (key: string) => searchParams.has(key) ? Number(p(key)) : undefined
    const pBool = (key: string) => searchParams.has(key) ? p(key) === "true" : undefined
    const pArr = (key: string) => searchParams.has(key) ? p(key)!.split(",") : undefined
    const searchQuery = p("q")?.trim()
    const isSearch = Boolean(searchQuery && searchQuery.length >= 2)

    const params: NoodlesCoinListParams = {
      pagination: {
        offset: pNum("offset") ?? 0,
        limit: pNum("limit") ?? (isSearch ? 100 : 50),
      },
      orderBy: (p("orderBy") as NoodlesCoinListParams["orderBy"]) ?? (isSearch ? "published_at" : undefined),
      orderDirection: (p("orderDirection") as "asc" | "desc") ?? (isSearch ? "desc" : undefined),
      filters: {
        protocol: pArr("protocol") ?? (isSearch ? ["blast-fun-bonding-curve"] : undefined),
        coinIds: pArr("coinIds"),
        devAddress: p("devAddress") ?? undefined,
        isGraduated: pBool("isGraduated"),
        atLeast1SocialLink: pBool("atLeast1SocialLink"),
        hasX: pBool("hasX"),
        hasTelegram: pBool("hasTelegram"),
        hasWebsite: pBool("hasWebsite"),
        devSellAll: pBool("devSellAll"),
        devStillHolding: pBool("devStillHolding"),
        top10HoldingPercentMin: pNum("top10HoldingPercentMin"),
        top10HoldingPercentMax: pNum("top10HoldingPercentMax"),
        devHoldingPercentMin: pNum("devHoldingPercentMin"),
        devHoldingPercentMax: pNum("devHoldingPercentMax"),
        sniperHoldingPercentMin: pNum("sniperHoldingPercentMin"),
        sniperHoldingPercentMax: pNum("sniperHoldingPercentMax"),
        holdersMin: pNum("holdersMin"),
        holdersMax: pNum("holdersMax"),
        marketCapMin: pNum("marketCapMin"),
        marketCapMax: pNum("marketCapMax"),
        bondingCurveProgressMin: pNum("bondingCurveProgressMin"),
        bondingCurveProgressMax: pNum("bondingCurveProgressMax"),
        volume24hMin: pNum("volume24hMin"),
        volume24hMax: pNum("volume24hMax"),
        txs24hMin: pNum("txs24hMin"),
        txs24hMax: pNum("txs24hMax"),
        txsBuy24hMin: pNum("txsBuy24hMin"),
        txsBuy24hMax: pNum("txsBuy24hMax"),
        txsSell24hMin: pNum("txsSell24hMin"),
        txsSell24hMax: pNum("txsSell24hMax"),
      },
    }

    const noodlesRes = await fetchNoodlesCoinList(params)

    if (!noodlesRes) {
      if (isSearch) {
        console.error("Noodles coin list: no response (check NOODLES_API_KEY or API availability)")
      }
      return NextResponse.json({ coins: [], success: true })
    }

    let coins = noodlesRes.data ?? []

    if (params.filters?.isGraduated === true) {
      coins = coins.filter((c) => !isTestCoin(c))
    }

    if (isSearch && searchQuery) {
      const lower = searchQuery.toLowerCase()
      coins = coins.filter(
        (c) =>
          c.name.toLowerCase().includes(lower) ||
          c.symbol.toLowerCase().includes(lower) ||
          c.coinType.toLowerCase().includes(lower)
      )
    }

    return NextResponse.json({
      coins,
      success: true,
    })
  } catch (error) {
    console.error("Error in Noodles coin list API:", error)
    return NextResponse.json({ coins: [], success: true })
  }
}