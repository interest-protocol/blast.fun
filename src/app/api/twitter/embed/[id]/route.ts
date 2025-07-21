import { env } from "@/env"
import { NextRequest, NextResponse } from "next/server"

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params
    const appUrl = env.VERCEL_URL || "http://localhost:3000"

    const html = `<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    
    <!-- Twitter Player Card Tags -->
    <meta name="twitter:card" content="player" />
    <meta name="twitter:site" content="@xpump" />
    <meta name="twitter:title" content="Trade on xPump" />
    <meta name="twitter:description" content="Connect wallet and trade tokens directly" />
    <meta name="twitter:player" content="${appUrl}/x-card/${id}" />
    <meta name="twitter:player:width" content="480" />
    <meta name="twitter:player:height" content="720" />
    <meta name="twitter:image" content="${appUrl}/api/og?poolId=${id}" />
    
    <!-- OpenGraph tags -->
    <meta property="og:title" content="Trade on xPump" />
    <meta property="og:description" content="Connect wallet and trade tokens directly" />
    <meta property="og:image" content="${appUrl}/api/og?poolId=${id}" />
    <meta property="og:type" content="video.other" />
    
    <title>xPump Trading</title>
</head>
<body>
    <script>
        const trackingId = Math.random().toString(36).substring(7);
        setTimeout(() => {
            window.location.href = "${appUrl}/x-card/${id}?ref=twitter&t=" + Date.now();
        }, 100);
    </script>
    <div style="display: flex; align-items: center; justify-content: center; height: 100vh; background: #000; color: #fff; font-family: monospace;">
        <div style="text-align: center;">
            <div style="font-size: 24px; margin-bottom: 10px;">LOADING::XPUMP</div>
            <div style="font-size: 14px; opacity: 0.7;">Initializing trading terminal...</div>
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