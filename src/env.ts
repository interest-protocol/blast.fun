import { createEnv } from "@t3-oss/env-nextjs"
import { z } from "zod"

export const env = createEnv({
	server: {
		AUTH_SECRET: z.string().min(1),
		DATABASE_URL: z.string().min(1),

		TWITTER_API_IO_KEY: z.string().min(1),

		TWITTER_CLIENT_SECRET: z.string().min(1),
		TWITTER_CLIENT_ID: z.string().min(1),

		NEXTAUTH_URL: z.string().url().optional(),
	},
	client: {
		NEXT_PUBLIC_DEFAULT_NETWORK: z.union([z.literal("mainnet"), z.literal("testnet")]),
		NEXT_PUBLIC_FEE_ADDRESS: z.string().min(1),
		NEXT_PUBLIC_GRAPHQL_API_URL: z.string().url(),
	},
	runtimeEnv: {
		NEXT_PUBLIC_DEFAULT_NETWORK: process.env.NEXT_PUBLIC_DEFAULT_NETWORK,
		NEXT_PUBLIC_FEE_ADDRESS: process.env.NEXT_PUBLIC_FEE_ADDRESS,
		NEXT_PUBLIC_GRAPHQL_API_URL: process.env.NEXT_PUBLIC_GRAPHQL_API_URL,

		AUTH_SECRET: process.env.AUTH_SECRET,
		DATABASE_URL: process.env.DATABASE_URL,

		TWITTER_API_IO_KEY: process.env.TWITTER_API_IO_KEY,

		TWITTER_CLIENT_SECRET: process.env.TWITTER_CLIENT_SECRET,
		TWITTER_CLIENT_ID: process.env.TWITTER_CLIENT_ID,

		NEXTAUTH_URL: process.env.NEXTAUTH_URL,
	},
})
