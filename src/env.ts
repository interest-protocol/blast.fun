import { createEnv } from "@t3-oss/env-nextjs"
import { z } from "zod"

export const env = createEnv({
	server: {
		VERCEL_URL: z.string().optional(),

		NEXTAUTH_URL: z.url().optional(),
		REDIS_URL: z.string().optional(),
		DATABASE_URL: z.string().optional().default(""),
		AUTH_SECRET: z.string().optional().default("dummy-secret-for-streaming-only"),

		SUI_PRIVATE_KEY: z.string().optional().default(""),
		NEXA_API_KEY: z.string().optional().default(""),

		TWITTER_API_IO_KEY: z.string().optional().default(""),
		TWITTER_CLIENT_SECRET: z.string().optional().default(""),
		TWITTER_CLIENT_ID: z.string().optional().default(""),

		// LiveKit - Required for streaming
		LIVEKIT_API_KEY: z.string().min(1),
		LIVEKIT_API_SECRET: z.string().min(1),
	},
	client: {
		NEXT_PUBLIC_DEFAULT_NETWORK: z.union([z.literal("mainnet"), z.literal("testnet")]).optional().default("mainnet"),
		NEXT_PUBLIC_FEE_ADDRESS: z.string().optional().default(""),
		NEXT_PUBLIC_GRAPHQL_API_URL: z.url().optional().default("https://api.memez.interestlabs.io/v2/graphql"),
		NEXT_PUBLIC_SITE_URL: z.url().optional(),
		
		// LiveKit - Required for streaming
		NEXT_PUBLIC_LIVEKIT_WS_URL: z.url(),
	},
	runtimeEnv: {
		NEXT_PUBLIC_DEFAULT_NETWORK: process.env.NEXT_PUBLIC_DEFAULT_NETWORK,
		NEXT_PUBLIC_FEE_ADDRESS: process.env.NEXT_PUBLIC_FEE_ADDRESS,
		NEXT_PUBLIC_GRAPHQL_API_URL: process.env.NEXT_PUBLIC_GRAPHQL_API_URL,
		NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
		NEXT_PUBLIC_LIVEKIT_WS_URL: process.env.NEXT_PUBLIC_LIVEKIT_WS_URL,

		VERCEL_URL: process.env.VERCEL_URL,

		NEXTAUTH_URL: process.env.NEXTAUTH_URL,
		REDIS_URL: process.env.REDIS_URL,
		DATABASE_URL: process.env.DATABASE_URL,
		AUTH_SECRET: process.env.AUTH_SECRET,

		SUI_PRIVATE_KEY: process.env.SUI_PRIVATE_KEY,
		NEXA_API_KEY: process.env.NEXA_API_KEY,

		TWITTER_API_IO_KEY: process.env.TWITTER_API_IO_KEY,
		TWITTER_CLIENT_SECRET: process.env.TWITTER_CLIENT_SECRET,
		TWITTER_CLIENT_ID: process.env.TWITTER_CLIENT_ID,

		LIVEKIT_API_KEY: process.env.LIVEKIT_API_KEY,
		LIVEKIT_API_SECRET: process.env.LIVEKIT_API_SECRET,
	},
	skipValidation: !!process.env.SKIP_ENV_VALIDATION,
	emptyStringAsUndefined: true,
})