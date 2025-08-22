import { BASE_DOMAIN } from "@/constants"
import { env } from "@/env"
import { NextRequest, NextResponse } from "next/server"

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params
    const searchParams = request.nextUrl.searchParams
    const refCode = searchParams.get("ref")
    const appUrl = new URL(BASE_DOMAIN)

    // Get user agent to detect Twitter/social media bots
    const userAgent = request.headers.get("user-agent") || ""
    const isBot = /bot|crawler|spider|twitter|facebook|whatsapp|telegram|discord|slack/i.test(userAgent)

    // build URLs
    const xCardUrl = refCode ? `${appUrl}/x-card/${id}?ref=${refCode}` : `${appUrl}/x-card/${id}`
    const tokenUrl = refCode ? `${appUrl}/token/${id}?ref=${refCode}` : `${appUrl}/token/${id}`

    // If not a bot, redirect to the actual token page
    if (!isBot) {
        return NextResponse.redirect(tokenUrl, { status: 302 })
    }

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
    <meta name="twitter:creator" content="@blastdotfun">
    <meta name="twitter:site" content="@blastdotfun" />
    <meta name="twitter:image" content="${appUrl}/logo/blast-bg.png" />
    <meta name="twitter:title" content="Trade memecoins on blast.fun directly within X." />
    <meta name="twitter:description" content="Buy & sell memecoins on blast.fun directly within X. Just click me and you'll see for yourself!" />

    <meta name="twitter:url" content="${xCardUrl}" />
    <meta name="twitter:player" content="${xCardUrl}" />
    <meta name="twitter:player:width" content="800" />
    <meta name="twitter:player:height" content="1500" />

    <!-- OpenGraph tags -->
    <meta property="og:type" content="video.movie" />
    <meta property="og:title" content="Trade memecoins on blast.fun directly within X." />
    <meta property="og:description" content="Connect wallet and trade tokens directly" />
    <meta property="og:image" content="${appUrl}/logo/blast-bg.png" />
    <meta property="og:url" content="${xCardUrl}" />
    
    <title>blast.fun terminal</title>
    
    <!-- Fallback redirect for regular browsers -->
    <script>
        // Small delay to allow Twitter to process meta tags
        setTimeout(function() {
            // Check if we're not in an iframe (not embedded)
            if (window.self === window.top) {
                // Not in iframe, redirect to main site
                window.location.replace("${tokenUrl}");
            }
        }, 100);
    </script>
</head>
<body style="margin: 0; padding: 0; background: #000;">
    <div style="display: flex; align-items: center; justify-content: center; height: 100vh; color: #fff; font-family: monospace;">
        <div style="text-align: center;">
            <p style="font-size: 14px; opacity: 0.8;">Loading blast.fun...</p>
            <p style="font-size: 12px; opacity: 0.6; margin-top: 10px;">If you're not redirected, <a href="${tokenUrl}" style="color: #00ff00;">click here</a></p>
        </div>
    </div>
</body>
</html>`

    return new NextResponse(html, {
        headers: {
            "Content-Type": "text/html",
            "Cache-Control": "no-cache, no-store, must-revalidate",
        },
    })
}