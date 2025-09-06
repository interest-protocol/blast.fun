"use client"

import React, { createContext, useContext, useMemo } from "react"
import { useQuery } from "@tanstack/react-query"
import { Token } from "@/types/token"
import { useTokenProtection } from "@/hooks/use-token-protection"

interface TwitterRelation {
	id: string
	twitterUserId: string
	twitterUsername: string
	address: string
	purchases: any
	createdAt: string
	updatedAt: string
}

interface TwitterRelationsContextType {
	twitterRelations: TwitterRelation[] | null
	addressToTwitter: Map<string, string>
	isLoading: boolean
	error: Error | null
}

const TwitterRelationsContext = createContext<TwitterRelationsContextType | undefined>(undefined)

interface TwitterRelationsProviderProps {
	children: React.ReactNode
	pool: Token
}

export function TwitterRelationsProvider({ children, pool }: TwitterRelationsProviderProps) {
	// @dev: Get protection settings to check if revealTraderIdentity is enabled
	const { settings: protectionSettings } = useTokenProtection(
		pool.pool?.poolId || "",
		pool.pool?.isProtected
	)

	const { data: twitterRelations, isLoading, error } = useQuery({
		queryKey: ["twitter-relations", pool.pool?.poolId],
		queryFn: async () => {
			const response = await fetch(`/api/pool/${pool.pool?.poolId}/twitter-relations`, {
				headers: {
					'cloudflare-cache': '15',
					'cache-control': 'no-store'
				}
			})
			if (!response.ok) return null
			const data = await response.json()
			return data.relations as TwitterRelation[]
		},
		enabled: !!pool.pool?.poolId && 
				 pool.pool?.isProtected && 
				 protectionSettings?.revealTraderIdentity === true,
		staleTime: 10000,
		refetchInterval: 10000,
		refetchOnWindowFocus: false
	})

	// Create a map of addresses to Twitter usernames
	const addressToTwitter = useMemo(() => {
		const map = new Map<string, string>()
		if (twitterRelations) {
			twitterRelations.forEach(relation => {
				map.set(relation.address, relation.twitterUsername)
			})
		}
		return map
	}, [twitterRelations])

	const value: TwitterRelationsContextType = {
		twitterRelations: twitterRelations || null,
		addressToTwitter,
		isLoading,
		error
	}

	return (
		<TwitterRelationsContext.Provider value={value}>
			{children}
		</TwitterRelationsContext.Provider>
	)
}

export function useTwitterRelations() {
	const context = useContext(TwitterRelationsContext)
	if (context === undefined) {
		throw new Error("useTwitterRelations must be used within a TwitterRelationsProvider")
	}
	return context
}

export type { TwitterRelation }