import { env } from "@/env"

async function serverFetch(endpoint: string, options?: RequestInit) {
	const url = endpoint.startsWith('http')
		? endpoint
		: `${env.NEXT_PUBLIC_NEXA_API_URL}${endpoint}`

	const response = await fetch(url, {
		...options,
		headers: {
			"x-api-key": env.NEXA_API_KEY,
			"Content-Type": "application/json",
			...options?.headers,
		},
	})

	return response
}

async function serverInternalFetch(endpoint: string, options?: RequestInit) {
	const NEXA_INTERNAL_BASE_URL = "https://api-ex.insidex.trade"
	const url = endpoint.startsWith('http')
		? endpoint
		: `${NEXA_INTERNAL_BASE_URL}${endpoint}`

	const response = await fetch(url, {
		...options,
		headers: {
			"x-api-key": env.NEXA_API_KEY,
			"Content-Type": "application/json",
			...options?.headers,
		},
	})

	return response
}

export const nexa = {
	server: {
		fetch: serverFetch,
		fetchInternal: serverInternalFetch,
	},
} as const