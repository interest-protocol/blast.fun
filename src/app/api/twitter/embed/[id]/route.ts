import { env } from "@/env"
import { NextRequest, NextResponse } from "next/server"

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params
    const appUrl = env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"

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
    <meta name="twitter:creator" content="@xpumpfun">
    <meta name="twitter:site" content="@xpumpfun" />
    <meta name="twitter:image" content="${appUrl}/embed/xpump-twitter-logo.png" />
    <meta name="twitter:title" content="Trade memecoins on xPump directly within X." />
    <meta name="twitter:description" content="Buy & sell memecoins on xPump directly within X. Just click me and you'll see!" />

    <meta name="twitter:url" content="${appUrl}/x-card/${id}" />
    <meta name="twitter:player" content="${appUrl}/x-card/${id}" />
    <meta name="twitter:player:width" content="800" />
    <meta name="twitter:player:height" content="1500" />

    <!-- OpenGraph tags -->
    <meta property="og:type" content="video.movie" />
    <meta property="og:title" content="Trade memecoins on xPump directly within X." />
    <meta property="og:description" content="Connect wallet and trade tokens directly" />
    <meta property="og:image" content="${appUrl}/embed/xpump-twitter-logo.png" />
    <meta property="og:url" content="${appUrl}/x-card/${id}" />
    
    <title>xPump Trading</title>
</head>
</html>`

    return new NextResponse(html, {
        headers: {
            "Content-Type": "text/html",
            "Cache-Control": "no-cache, no-store, must-revalidate",
        },
    })
}