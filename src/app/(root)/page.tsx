"use client"

import { useState } from "react"
import { usePoolsWithMetadata } from "@/hooks/pump/use-pools-with-metadata"
import { TokenCard } from "@/components/tokens/token-card"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skull, ChevronLeft, ChevronRight } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

export default function DiscoveryPage() {
	const [page, setPage] = useState(1)
	const [bondedPage, setBondedPage] = useState(1)
	const pageSize = 12

	const {
		data: pools = [],
		isLoading,
		error,
	} = usePoolsWithMetadata({
		page,
		pageSize,
	})

	// Separate pools into bonded and non-bonded
	const bondedPools = pools.filter((pool) => parseFloat(pool.bondingCurve) >= 100)
	const nonBondedPools = pools.filter((pool) => parseFloat(pool.bondingCurve) < 100)
	const hasMore = pools.length === pageSize

	const LoadingSkeleton = () => (
		<Card className="border-2 bg-background/50 backdrop-blur-sm shadow-2xl">
			<CardHeader className="pb-4 border-b">
				<div className="flex items-start justify-between gap-4">
					<div className="flex items-center gap-3">
						<Skeleton className="w-12 h-12 rounded-lg" />
						<div>
							<Skeleton className="h-4 w-20 mb-1" />
							<Skeleton className="h-3 w-32" />
						</div>
					</div>
				</div>
			</CardHeader>
			<CardContent className="pt-4">
				<div className="space-y-2">
					<Skeleton className="h-4 w-full" />
					<Skeleton className="h-4 w-3/4" />
					<Skeleton className="h-4 w-1/2" />
				</div>
			</CardContent>
		</Card>
	)

	const TokenGrid = ({ tokens, isLoading }: { tokens: typeof pools; isLoading: boolean }) => {
		if (isLoading && tokens.length === 0) {
			return (
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
					{Array.from({ length: pageSize }).map((_, i) => (
						<LoadingSkeleton key={i} />
					))}
				</div>
			)
		}

		if (tokens.length === 0) {
			return (
				<Card className="border-2 bg-background/50 backdrop-blur-sm shadow-2xl">
					<CardContent className="py-16">
						<div className="text-center">
							<Skull className="w-12 h-12 mx-auto text-foreground/20 mb-4" />
							<p className="font-mono text-sm uppercase text-muted-foreground">NO::TOKENS::FOUND</p>
							<p className="font-mono text-xs uppercase text-muted-foreground/60 mt-2">
								CHECK::BACK::LATER::FOR::NEW::TOKENS
							</p>
						</div>
					</CardContent>
				</Card>
			)
		}

		return (
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
				{tokens.map((pool) => (
					<TokenCard key={pool.poolId} pool={pool} />
				))}
			</div>
		)
	}

	return (
		<div className="min-h-screen">
			<div className="mb-8">
				<h1 className="text-4xl font-bold font-mono uppercase tracking-wider text-foreground/80 mb-2">
					TOKEN::DISCOVERY
				</h1>
				<p className="font-mono text-sm uppercase text-muted-foreground">
					SURVEILLANCE::ACTIVE | MONITORING::{pools.length} ASSETS
				</p>
			</div>

			{error && (
				<Card className="border-2 border-destructive bg-destructive/10 mb-8">
					<CardContent className="pt-6">
						<div className="flex items-center gap-3">
							<Skull className="w-5 h-5 text-destructive" />
							<p className="font-mono text-sm uppercase text-destructive">
								ERROR::LOADING::DATA - {error.message}
							</p>
						</div>
					</CardContent>
				</Card>
			)}

			<Tabs defaultValue="active" className="w-full">
				<TabsList className="grid w-full max-w-md grid-cols-2 mb-8">
					<TabsTrigger value="active" className="font-mono uppercase">
						ACTIVE::BONDING ({nonBondedPools.length})
					</TabsTrigger>
					<TabsTrigger value="bonded" className="font-mono uppercase">
						FULLY::BONDED ({bondedPools.length})
					</TabsTrigger>
				</TabsList>

				<TabsContent value="active">
					<TokenGrid tokens={nonBondedPools} isLoading={isLoading} />

					{nonBondedPools.length > 0 && (
						<div className="mt-8 flex items-center justify-between">
							<p className="font-mono text-sm uppercase text-muted-foreground">
								PAGE::{page} | DISPLAYING::{nonBondedPools.length} TOKENS
							</p>
							<div className="flex items-center gap-2">
								<Button
									variant="outline"
									size="sm"
									onClick={() => setPage((p) => Math.max(1, p - 1))}
									disabled={page === 1 || isLoading}
									className="font-mono uppercase"
								>
									<ChevronLeft className="w-4 h-4 mr-1" />
									PREVIOUS
								</Button>
								<Button
									variant="outline"
									size="sm"
									onClick={() => setPage((p) => p + 1)}
									disabled={!hasMore || isLoading}
									className="font-mono uppercase"
								>
									NEXT
									<ChevronRight className="w-4 h-4 ml-1" />
								</Button>
							</div>
						</div>
					)}
				</TabsContent>

				<TabsContent value="bonded">
					<TokenGrid tokens={bondedPools} isLoading={isLoading} />

					{bondedPools.length > 0 && (
						<div className="mt-8 flex items-center justify-between">
							<p className="font-mono text-sm uppercase text-muted-foreground">
								DISPLAYING::{bondedPools.length} BONDED::TOKENS
							</p>
						</div>
					)}
				</TabsContent>
			</Tabs>
		</div>
	)
}
