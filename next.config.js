import { createJiti } from "jiti"
const jiti = createJiti(import.meta.url)
jiti("./src/env")

/** @type {import('next').NextConfig} */
export default {
    devIndicators: false,
    compiler: {
        removeConsole: process.env.NODE_ENV === 'production'
    },
    serverExternalPackages: ['@prisma/client', 'prisma'],
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
        minimumCacheTTL: 1500000
    },
    async redirects() {
        return [
            {
                source: '/meme/:path*',
                destination: '/token/:path*',
                permanent: true,
            },
        ]
    }
}
