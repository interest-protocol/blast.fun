"use client";

import { useQuery } from "@tanstack/react-query";
import type { NexaToken, TokenFilters } from "@/types/token";

const API_ENDPOINTS = {
    latest: `/api/tokens/latest`,
    aboutToBond: `/api/tokens/about-to-bond`,
    bonded: `/api/tokens/bonded`,
} as const;

type EndpointType = keyof typeof API_ENDPOINTS;

const CACHE_TTL_SECONDS = 3 * 24 * 60 * 60;

async function fetchTokens(
    endpoint: EndpointType,
    filters?: TokenFilters
): Promise<NexaToken[]> {
    const url = new URL(API_ENDPOINTS[endpoint], window.location.origin);

    if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                if (Array.isArray(value)) {
                    value.forEach((v) => url.searchParams.append(key, v));
                } else {
                    url.searchParams.append(key, String(value));
                }
            }
        });
    }

    const response = await fetch(url.toString(), {
        next: { revalidate: CACHE_TTL_SECONDS }, 
        headers: {
            Accept: "application/json",
            "cache-control": `public, max-age=${CACHE_TTL_SECONDS}`,
        },
    });

    if (!response.ok) {
        throw new Error(`Failed to fetch tokens from ${endpoint}`);
    }

    return response.json();
}

export function useLatestTokens(
    filters?: TokenFilters,
    options?: { enabled?: boolean; refetchInterval?: number }
) {
    return useQuery({
        queryKey: ["tokens", "latest", filters],
        queryFn: () => fetchTokens("latest", filters),
        enabled: options?.enabled ?? true,
        refetchInterval: options?.refetchInterval ?? 2500,
        staleTime: CACHE_TTL_SECONDS * 1000,
        gcTime: CACHE_TTL_SECONDS * 1000,
    });
}

export function useAboutToBondTokens(
    filters?: TokenFilters,
    options?: { enabled?: boolean; refetchInterval?: number }
) {
    return useQuery({
        queryKey: ["tokens", "aboutToBond", filters],
        queryFn: () => fetchTokens("aboutToBond", filters),
        enabled: options?.enabled ?? true,
        refetchInterval: options?.refetchInterval ?? 5000,
        staleTime: CACHE_TTL_SECONDS * 1000,
        gcTime: CACHE_TTL_SECONDS * 1000,
    });
}

export function useBondedTokens(
    filters?: TokenFilters,
    options?: { enabled?: boolean; refetchInterval?: number }
) {
    return useQuery({
        queryKey: ["tokens", "bonded", filters],
        queryFn: () => fetchTokens("bonded", filters),
        enabled: options?.enabled ?? true,
        refetchInterval: options?.refetchInterval ?? 30000,
        staleTime: CACHE_TTL_SECONDS * 1000,
        gcTime: CACHE_TTL_SECONDS * 1000,
    });
}
