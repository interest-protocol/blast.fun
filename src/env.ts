import { createEnv } from "@t3-oss/env-nextjs"
import { z } from "zod"

export const env = createEnv({
	server: {
		VERCEL_URL: z.string().optional(),

		NEXTAUTH_URL: z.url().optional(),
		REDIS_URL: z.string().optional(),
		DATABASE_URL: z.string().min(1),
		AUTH_SECRET: z.string().min(1),

		SUI_PRIVATE_KEY: z.string().min(1),
		NEXA_API_KEY: z.string().min(1),

		TWITTER_CLIENT_SECRET: z.string().min(1),
		TWITTER_CLIENT_ID: z.string().min(1),
		CF_TURNSTILE_SECRET_KEY: z.string().min(1),
	},
	client: {
		NEXT_PUBLIC_DEFAULT_NETWORK: z.union([z.literal("mainnet"), z.literal("testnet")]),
		NEXT_PUBLIC_FEE_ADDRESS: z.string().min(1),
		NEXT_PUBLIC_GRAPHQL_API_URL: z.url(),
		NEXT_PUBLIC_CF_TURNSTILE_SITE_KEY: z.string().min(1),
	},
	runtimeEnv: {
		NEXT_PUBLIC_DEFAULT_NETWORK: process.env.NEXT_PUBLIC_DEFAULT_NETWORK,
		NEXT_PUBLIC_FEE_ADDRESS: process.env.NEXT_PUBLIC_FEE_ADDRESS,
		NEXT_PUBLIC_GRAPHQL_API_URL: process.env.NEXT_PUBLIC_GRAPHQL_API_URL,
		NEXT_PUBLIC_CF_TURNSTILE_SITE_KEY: process.env.NEXT_PUBLIC_CF_TURNSTILE_SITE_KEY,

		VERCEL_URL: process.env.VERCEL_URL,

		NEXTAUTH_URL: process.env.NEXTAUTH_URL,
		REDIS_URL: process.env.REDIS_URL,
		DATABASE_URL: process.env.DATABASE_URL,
		AUTH_SECRET: process.env.AUTH_SECRET,

		SUI_PRIVATE_KEY: process.env.SUI_PRIVATE_KEY,
		NEXA_API_KEY: process.env.NEXA_API_KEY,

		TWITTER_CLIENT_SECRET: process.env.TWITTER_CLIENT_SECRET,
		TWITTER_CLIENT_ID: process.env.TWITTER_CLIENT_ID,
		CF_TURNSTILE_SECRET_KEY: process.env.CF_TURNSTILE_SECRET_KEY,
	},
})
