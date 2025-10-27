"use client"

import { useState } from "react"
import { Search, Loader2 } from "lucide-react"
import { cn } from "@/utils/index"
import { Logo } from "@/components/ui/logo"
import { SuiClient, getFullnodeUrl } from "@mysten/sui/client"
import Link from "next/link"
import { suiClient } from "@/lib/sui-client"

interface Launch {
	coinType: string
	poolObjectId: string
	creatorAddress: string
	twitterUsername: string
}

interface TokenWithMetadata extends Launch {
	name?: string
	symbol?: string
	iconUrl?: string | null
	description?: string
}

export default function SearchByCreatorPage() {
	const [query, setQuery] = useState("")
	const [loading, setLoading] = useState(false)
	const [tokens, setTokens] = useState<TokenWithMetadata[]>([])
	const [searched, setSearched] = useState(false)
	const [error, setError] = useState<string | null>(null)

	const handleSearch = async (e: React.FormEvent) => {
		e.preventDefault()

		const trimmedQuery = query.trim()
		if (!trimmedQuery) return

		setLoading(true)
		setError(null)
		setSearched(true)

		// @dev: Update URL with query parameter
		const searchParams = new URLSearchParams(window.location.search)
		searchParams.set('query', trimmedQuery)
		window.history.pushState({}, '', `?${searchParams.toString()}`)

		try {
			const response = await fetch(`/api/search/creator?q=${encodeURIComponent(trimmedQuery)}`)
			const data = await response.json()

			if (!response.ok) {
				throw new Error(data.error || "Failed to search")
			}

			const launches: Launch[] = data.launches || []

			// @dev: Fetch metadata for each token using SuiClient
			const tokensWithMetadata = await Promise.all(
				launches.map(async (launch) => {
					try {
						const metadata = await suiClient.getCoinMetadata({ coinType: launch.coinType })
						return {
							...launch,
							name: metadata?.name,
							symbol: metadata?.symbol,
							iconUrl: metadata?.iconUrl,
							description: metadata?.description
						}
					} catch (err) {
						console.error(`Failed to fetch metadata for ${launch.coinType}:`, err)
						return launch
					}
				})
			)

			setTokens(tokensWithMetadata)
		} catch (err) {
			console.error("Search error:", err)
			setError(err instanceof Error ? err.message : "Failed to search tokens")
			setTokens([])
		} finally {
			setLoading(false)
		}
	}

	return (
		<div className="container max-w-5xl mx-auto py-8 px-4">
			{/* Header */}
			<div className="mb-8">
				<h1 className="text-2xl sm:text-3xl font-mono font-bold uppercase mb-2">
					Search by Creator
				</h1>
				<p className="text-sm text-muted-foreground font-mono">
					Find tokens by creator address or X handle
				</p>
			</div>

			{/* Search Form */}
			<form onSubmit={handleSearch} className="mb-8">
				<div className="flex gap-2">
					<div className="relative flex-1">
						<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
						<input
							type="text"
							value={query}
							onChange={(e) => setQuery(e.target.value)}
							placeholder="Enter creator address (0x...) or X handle (@username)"
							className={cn(
								"w-full h-12 pl-10 pr-4 rounded-md",
								"bg-card/50 border border-border/50",
								"text-sm font-mono",
								"focus:outline-none focus:ring-2 focus:ring-destructive/50",
								"placeholder:text-muted-foreground/50"
							)}
							disabled={loading}
						/>
					</div>
					<button
						type="submit"
						disabled={loading}
						className={cn(
							"px-6 h-12 rounded-md",
							"bg-destructive/80 hover:bg-destructive",
							"text-destructive-foreground font-mono text-sm uppercase",
							"transition-all",
							"disabled:opacity-50 disabled:cursor-not-allowed",
							"flex items-center gap-2"
						)}
					>
						{loading ? (
							<>
								<Loader2 className="h-4 w-4 animate-spin" />
								Searching
							</>
						) : (
							"Search"
						)}
					</button>
				</div>
			</form>

			{/* Results */}
			<div className="bg-card/50 border border-border/50 rounded-lg overflow-hidden">
				{loading ? (
					<div className="p-12 text-center">
						<Logo className="w-12 h-12 mx-auto text-foreground/20 mb-4 animate-pulse" />
						<p className="font-mono text-sm uppercase text-muted-foreground">
							Searching...
						</p>
					</div>
				) : error ? (
					<div className="p-12 text-center">
						<Logo className="w-12 h-12 mx-auto text-foreground/20 mb-4" />
						<p className="font-mono text-sm uppercase text-destructive mb-2">
							{error}
						</p>
						<p className="font-mono text-xs uppercase text-muted-foreground/60">
							Try another search
						</p>
					</div>
				) : !searched ? (
					<div className="p-12 text-center">
						<Search className="w-12 h-12 mx-auto text-foreground/20 mb-4" />
						<p className="font-mono text-sm uppercase text-muted-foreground">
							Enter a creator address or X handle to search
						</p>
					</div>
				) : tokens.length === 0 ? (
					<div className="p-12 text-center">
						<Logo className="w-12 h-12 mx-auto text-foreground/20 mb-4" />
						<p className="font-mono text-sm uppercase text-muted-foreground">
							No tokens found
						</p>
						<p className="font-mono text-xs uppercase text-muted-foreground/60 mt-2">
							This creator hasn&apos;t launched any tokens yet
						</p>
					</div>
				) : (
					<div>
						<div className="p-4 border-b border-border/50">
							<p className="font-mono text-xs uppercase text-muted-foreground">
								Found {tokens.length} token{tokens.length !== 1 ? 's' : ''} by @{tokens[0]?.twitterUsername || 'creator'}
							</p>
						</div>
						<div className="divide-y divide-border/30">
							{tokens.map((token) => (
								<Link
									key={token.coinType}
									href={`/token/${token.coinType}`}
									target="_blank"
									rel="noopener noreferrer"
									className="block p-4 hover:bg-muted/5 transition-colors"
								>
									<div className="flex items-center gap-4">
										{token.iconUrl ? (
											// eslint-disable-next-line @next/next/no-img-element
											<img
												src={token.iconUrl}
												alt={token.name || token.symbol || "Token"}
												className="w-12 h-12 rounded-full"
												onError={(e) => {
													e.currentTarget.src = "/placeholder-token.png"
												}}
											/>
										) : (
											<div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
												<span className="text-xs font-mono text-muted-foreground">
													{token.symbol?.slice(0, 2) || "??"}
												</span>
											</div>
										)}
										<div className="flex-1">
											<div className="flex items-center gap-2">
												<h3 className="font-mono font-bold text-sm">
													{token.name || "Unknown Token"}
												</h3>
												<span className="font-mono text-xs text-muted-foreground">
													${token.symbol || "???"}
												</span>
											</div>
											{token.description && (
												<p className="text-xs text-muted-foreground mt-1 line-clamp-1">
													{token.description}
												</p>
											)}
											<p className="font-mono text-xs text-muted-foreground/60 mt-1">
												Pool: {token.poolObjectId.slice(0, 10)}...
											</p>
										</div>
									</div>
								</Link>
							))}
						</div>
					</div>
				)}
			</div>
		</div>
	)
}