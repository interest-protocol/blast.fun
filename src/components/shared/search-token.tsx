"use client"

import { useQuery } from "@apollo/client"
import { Loader2, Search } from "lucide-react"
import { useRouter } from "next/navigation"
import { useCallback, useEffect, useState } from "react"
import toast from "react-hot-toast"
import { useDebouncedCallback } from "use-debounce"
import { TokenAvatar } from "@/components/tokens/token-avatar"
import { Button } from "@/components/ui/button"
import { CommandDialog, CommandEmpty, CommandItem, CommandList } from "@/components/ui/command"
import { GET_POOL_BY_COIN_TYPE } from "@/graphql/pools"
import { nexaClient } from "@/lib/nexa"
import { formatNumberWithSuffix } from "@/utils/format"

interface SearchResult {
	type: "coin"
	icon?: string
	symbol: string
	name: string
	coinType: string
	mc?: number
	holderScore?: number
	price?: number
	coinMetadata?: {
		iconUrl?: string
		icon_url?: string
	}
	sellVolumeStats1d?: {
		volumeUsd: number
	}
	buyVolumeStats1d?: {
		volumeUsd: number
	}
}

export function SearchToken() {
	const [open, setOpen] = useState(false)
	const [query, setQuery] = useState("")
	const [searchResults, setSearchResults] = useState<SearchResult[]>([])
	const [loading, setLoading] = useState(false)
	const [selectedCoinType, setSelectedCoinType] = useState<string | null>(null)
	const router = useRouter()

	useQuery(GET_POOL_BY_COIN_TYPE, {
		variables: { type: selectedCoinType },
		skip: !selectedCoinType,
		onCompleted: (data) => {
			if (data?.coinPool?.poolId) {
				router.push(`/token/${data.coinPool.poolId}`)
				setOpen(false)
				setQuery("")
				setSearchResults([])
				setSelectedCoinType(null)
			}
		},
		onError: (error) => {
			console.error("Error fetching poolId:", error)
			toast.error("Something went wrong. Please try again later.")
			setSelectedCoinType(null)
		},
	})

	const handleSearch = useDebouncedCallback(async (searchQuery: string) => {
		if (!searchQuery || searchQuery.length < 2) {
			setSearchResults([])
			return
		}

		try {
			setLoading(true)
			const results = await nexaClient.searchTokens(searchQuery)
			setSearchResults(results || [])
		} catch (error) {
			console.error("Search error:", error)
			setSearchResults([])
		} finally {
			setLoading(false)
		}
	}, 500)

	useEffect(() => {
		handleSearch(query)
	}, [query, handleSearch])

	const handleSelect = useCallback((coinType: string) => {
		setSelectedCoinType(coinType)
	}, [])

	return (
		<>
			<Button
				variant="outline"
				className="h-9 rounded-xl px-2 transition-all duration-300 hover:bg-accent/50"
				onClick={() => setOpen(true)}
			>
				<Search className="h-4 w-4 text-muted-foreground" />
				<span className="hidden font-semibold text-muted-foreground text-sm md:inline-block">
					Search for tokens...
				</span>
			</Button>

			<CommandDialog
				open={open}
				onOpenChange={(isOpen) => {
					setOpen(isOpen)
					if (!isOpen) {
						setQuery("")
						setSearchResults([])
					}
				}}
				className="flex max-w-md flex-col gap-0 overflow-hidden rounded-xl p-0 shadow-xl"
				showCloseButton={false}
			>
				<div className="flex items-center border-b px-3">
					<Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
					<input
						className="flex h-14 w-full rounded-xl bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
						placeholder="Search for tokens..."
						value={query}
						onChange={(e) => setQuery(e.target.value)}
					/>
					{loading && <Loader2 className="h-4 w-4 animate-spin" />}
				</div>

				<CommandList className="max-h-[400px]">
					{query.length >= 2 && !loading && searchResults.length === 0 && (
						<CommandEmpty>No tokens found.</CommandEmpty>
					)}

					{searchResults.map((result) => (
						<CommandItem
							key={result.coinType}
							onSelect={() => handleSelect(result.coinType)}
							className="flex cursor-pointer items-center gap-3 rounded-lg px-4 py-3"
						>
							<TokenAvatar
								iconUrl={result.icon || result.coinMetadata?.iconUrl || result.coinMetadata?.icon_url}
								symbol={result.symbol}
								name={result.name}
								className="h-10 w-10 rounded-lg"
							/>
							<div className="flex flex-1 flex-col">
								<div className="flex items-center gap-2">
									<span className="font-bold font-mono text-foreground/90 text-sm uppercase tracking-wider">
										{result.symbol}
									</span>
									<span className="truncate text-muted-foreground text-xs">{result.name}</span>
								</div>
								{(result.mc || result.sellVolumeStats1d || result.buyVolumeStats1d) && (
									<div className="flex items-center gap-3 font-mono text-xs">
										{result.mc && (
											<div className="flex items-center gap-1">
												<span className="text-[10px] text-muted-foreground/60 uppercase tracking-wider">
													MC
												</span>
												<span className="font-semibold text-green-500/90">
													${formatNumberWithSuffix(result.mc)}
												</span>
											</div>
										)}
										{(result.sellVolumeStats1d || result.buyVolumeStats1d) && (
											<div className="flex items-center gap-1">
												<span className="text-[10px] text-muted-foreground/60 uppercase tracking-wider">
													VOL
												</span>
												<span className="font-semibold text-purple-500/90">
													$
													{formatNumberWithSuffix(
														(result.sellVolumeStats1d?.volumeUsd || 0) +
															(result.buyVolumeStats1d?.volumeUsd || 0)
													)}
												</span>
											</div>
										)}
									</div>
								)}
							</div>
						</CommandItem>
					))}
				</CommandList>
			</CommandDialog>
		</>
	)
}
