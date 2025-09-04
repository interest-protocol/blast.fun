"use client"

import { useQuery } from "@tanstack/react-query"
import type { Token, TokenFilters } from "@/types/token"

const API_ENDPOINTS = {
	latest: `/api/tokens/latest`,
	aboutToBond: `/api/tokens/about-to-bond`,
	bonded: `/api/tokens/bonded`
} as const

type EndpointType = keyof typeof API_ENDPOINTS

async function fetchTokens(
	endpoint: EndpointType,
	filters?: TokenFilters
): Promise<Token[]> {
	const url = new URL(API_ENDPOINTS[endpoint], window.location.origin)

	if (filters) {
		Object.entries(filters).forEach(([key, value]) => {
			if (value !== undefined && value !== null) {
				if (Array.isArray(value)) {
					value.forEach(v => url.searchParams.append(key, v))
				} else {
					url.searchParams.append(key, String(value))
				}
			}
		})
	}

	const response = await fetch(url.toString(), {
		next: { revalidate: 1 },
		headers: {
			"Accept": "application/json"
		}
	})

	if (!response.ok) {
		throw new Error(`Failed to fetch tokens from ${endpoint}`)
	}

	return response.json()
}

export function useLatestTokens(
	filters?: TokenFilters,
	options?: {
		enabled?: boolean
		refetchInterval?: number
	}
) {
	return useQuery({
		queryKey: ["tokens", "latest", filters],
		queryFn: () => fetchTokens("latest", filters),
		enabled: options?.enabled ?? true,
		refetchInterval: options?.refetchInterval ?? 2500,
		staleTime: 1000,
		gcTime: 5000
	})
}

export function useAboutToBondTokens(
	filters?: TokenFilters,
	options?: {
		enabled?: boolean
		refetchInterval?: number
	}
) {
	return useQuery({
		queryKey: ["tokens", "aboutToBond", filters],
		queryFn: () => fetchTokens("aboutToBond", filters),
		enabled: options?.enabled ?? true,
		refetchInterval: options?.refetchInterval ?? 5000,
		staleTime: 1000,
		gcTime: 5000
	})
}

export function useBondedTokens(
	filters?: TokenFilters,
	options?: {
		enabled?: boolean
		refetchInterval?: number
	}
) {
	return useQuery({
		queryKey: ["tokens", "bonded", filters],
		queryFn: () => fetchTokens("bonded", filters),
		enabled: options?.enabled ?? true,
		refetchInterval: options?.refetchInterval ?? 30000,
		staleTime: 1000,
		gcTime: 5000
	})
}