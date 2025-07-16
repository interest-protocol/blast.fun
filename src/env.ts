import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod'

export const env = createEnv({
    server: {
        DATABASE_URL: z.string().min(1),

        TWITTER_CLIENT_SECRET: z.string().min(1),
        TWITTER_CLIENT_ID: z.string().min(1),
        TWITTER_REDIRECT_URI: z.url(),
    },
    client: {
        NEXT_PUBLIC_FEE_ADDRESS: z.string().min(1),
    },
    runtimeEnv: {
        NEXT_PUBLIC_FEE_ADDRESS: process.env.NEXT_PUBLIC_FEE_ADDRESS,

        DATABASE_URL: process.env.DATABASE_URL,

        TWITTER_CLIENT_SECRET: process.env.TWITTER_CLIENT_SECRET,
        TWITTER_CLIENT_ID: process.env.TWITTER_CLIENT_ID,
        TWITTER_REDIRECT_URI: process.env.TWITTER_REDIRECT_URI
    }
});