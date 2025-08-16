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
        minimumCacheTTL: 1500000
    }
}
