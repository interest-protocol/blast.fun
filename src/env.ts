import { createEnv } from "@t3-oss/env-nextjs"
import { z } from "zod"

export const env = createEnv({
	server: {
		VERCEL_URL: z.string().optional(),

		NEXTAUTH_URL: z.url().optional(),
		AUTH_SECRET: z.string().min(1),
		DATABASE_URL: z.string().min(1),
		NEXA_API_KEY: z.string().min(1),
		SUI_PRIVATE_KEY: z.string().min(1),

		TWITTER_API_IO_KEY: z.string().min(1),
		TWITTER_CLIENT_SECRET: z.string().min(1),
		TWITTER_CLIENT_ID: z.string().min(1),

		UPSTASH_REDIS_REST_URL: z.url().optional(),
		UPSTASH_REDIS_REST_TOKEN: z.string().min(1).optional(),
	},
	client: {
		NEXT_PUBLIC_DEFAULT_NETWORK: z.union([z.literal("mainnet"), z.literal("testnet")]),
		NEXT_PUBLIC_FEE_ADDRESS: z.string().min(1),
		NEXT_PUBLIC_GRAPHQL_API_URL: z.url(),
		NEXT_PUBLIC_NEXA_API_URL: z.url(),
	},
	runtimeEnv: {
		NEXT_PUBLIC_DEFAULT_NETWORK: process.env.NEXT_PUBLIC_DEFAULT_NETWORK,
		NEXT_PUBLIC_FEE_ADDRESS: process.env.NEXT_PUBLIC_FEE_ADDRESS,
		NEXT_PUBLIC_GRAPHQL_API_URL: process.env.NEXT_PUBLIC_GRAPHQL_API_URL,
		NEXT_PUBLIC_NEXA_API_URL: process.env.NEXT_PUBLIC_NEXA_API_URL,

		VERCEL_URL: process.env.VERCEL_URL,

		NEXTAUTH_URL: process.env.NEXTAUTH_URL,
		AUTH_SECRET: process.env.AUTH_SECRET,
		DATABASE_URL: process.env.DATABASE_URL,
		NEXA_API_KEY: process.env.NEXA_API_KEY,
		SUI_PRIVATE_KEY: process.env.SUI_PRIVATE_KEY,

		TWITTER_API_IO_KEY: process.env.TWITTER_API_IO_KEY,
		TWITTER_CLIENT_SECRET: process.env.TWITTER_CLIENT_SECRET,
		TWITTER_CLIENT_ID: process.env.TWITTER_CLIENT_ID,

		UPSTASH_REDIS_REST_URL: process.env.UPSTASH_REDIS_REST_URL,
		UPSTASH_REDIS_REST_TOKEN: process.env.UPSTASH_REDIS_REST_TOKEN,
	},
})
