import { env } from "@/env"
import { NextRequest, NextResponse } from "next/server"

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params
    const searchParams = request.nextUrl.searchParams
    const refCode = searchParams.get("ref")
    const appUrl = env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"

    // build URL with referral code if present
    const xCardUrl = refCode ? `${appUrl}/x-card/${id}?ref=${refCode}` : `${appUrl}/x-card/${id}`

    const html = `<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">

    <!-- Twitter Cache Busting -->
    <meta name="twitter:cache" content="no-cache">
    <meta name="twitter:dnt" content="on">
    <meta name="twitter:timestamp" content="${Date.now()}">

    <!-- Cache Control -->
    <meta name="robots" content="noarchive">
    <meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate">
    <meta http-equiv="Pragma" content="no-cache">
    <meta http-equiv="Expires" content="0">

    <!-- Twitter Player Card Tags -->
    <meta name="twitter:card" content="player" />
    <meta name="twitter:creator" content="@xtermfun">
    <meta name="twitter:site" content="@xtermfun" />
    <meta name="twitter:image" content="${appUrl}/logo/xterm-bg.png" />
    <meta name="twitter:title" content="Trade memecoins on xTerminal directly within X." />
    <meta name="twitter:description" content="Buy & sell memecoins on xTerminal directly within X. Just click me and you'll see for yourself!" />

    <meta name="twitter:url" content="${xCardUrl}" />
    <meta name="twitter:player" content="${xCardUrl}" />
    <meta name="twitter:player:width" content="800" />
    <meta name="twitter:player:height" content="1500" />

    <!-- OpenGraph tags -->
    <meta property="og:type" content="video.movie" />
    <meta property="og:title" content="Trade memecoins on xTerminal directly within X." />
    <meta property="og:description" content="Connect wallet and trade tokens directly" />
    <meta property="og:image" content="${appUrl}/logo/xterm-bg.png" />
    <meta property="og:url" content="${xCardUrl}" />
    
    <title>xTerminal Trading</title>
</head>
</html>`

    return new NextResponse(html, {
        headers: {
            "Content-Type": "text/html",
            "Cache-Control": "no-cache, no-store, must-revalidate",
        },
    })
}