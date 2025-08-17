import { createJiti } from "jiti"
const jiti = createJiti(import.meta.url)
jiti("./src/env")

/** @type {import('next').NextConfig} */
export default {
    devIndicators: false,
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: '*'
            },
            {
                protocol: 'http',
                hostname: '*'
            }
        ],
        minimumCacheTTL: 1500000,
        dangerouslyAllowSVG: true,
        contentDispositionType: 'attachment',
        contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    },
    async headers() {
        return [
            {
                source: '/_next/image(.*)',
                headers: [
                    {
                        key: 'Cache-Control',
                        value: 'public, max-age=31536000, immutable',
                    },
                ],
            },
        ]
    }
}
