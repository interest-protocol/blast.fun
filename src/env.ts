import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod'

export const env = createEnv({
    server: {
        TWITTER_CLIENT_SECRET: z.string().min(1),
        TWITTER_CLIENT_ID: z.string().min(1),
        TWITTER_REDIRECT_URI: z.url(),
    },
    client: {
        // 
    },
    runtimeEnv: {
        TWITTER_CLIENT_SECRET: process.env.TWITTER_CLIENT_SECRET,
        TWITTER_CLIENT_ID: process.env.TWITTER_CLIENT_ID,
        TWITTER_REDIRECT_URI: process.env.TWITTER_REDIRECT_URI
    }
});