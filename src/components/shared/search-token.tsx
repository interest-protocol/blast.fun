"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Search, Loader2 } from "lucide-react"
import { useDebouncedCallback } from "use-debounce"
import { useQuery } from "@apollo/client"
import toast from "react-hot-toast"
import {
	CommandDialog,
	CommandEmpty,
	CommandItem,
	CommandList,
} from "@/components/ui/command"
import { Button } from "@/components/ui/button"
import { nexaClient } from "@/lib/nexa"
import { TokenAvatar } from "@/components/tokens/token-avatar"
import { formatNumberWithSuffix } from "@/utils/format"
import { GET_POOL_BY_COIN_TYPE } from "@/graphql/pools"

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
		}
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
				className="rounded-xl px-2 h-9 hover:bg-accent/50 transition-all duration-300"
				onClick={() => setOpen(true)}
			>
				<Search className="h-4 w-4 text-muted-foreground" />
				<span className="text-muted-foreground font-semibold text-sm hidden md:inline-block">
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
				className="flex max-w-md flex-col gap-0 overflow-hidden p-0 rounded-xl shadow-xl"
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
							className="flex rounded-lg items-center gap-3 px-4 py-3 cursor-pointer"
						>
							<TokenAvatar
								iconUrl={result.icon || result.coinMetadata?.iconUrl || result.coinMetadata?.icon_url}
								symbol={result.symbol}
								name={result.name}
								className="w-10 h-10 rounded-lg"
							/>
							<div className="flex flex-col flex-1">
								<div className="flex items-center gap-2">
									<span className="font-mono font-bold text-sm uppercase tracking-wider text-foreground/90">
										{result.symbol}
									</span>
									<span className="text-xs text-muted-foreground truncate">{result.name}</span>
								</div>
								{(result.mc || result.sellVolumeStats1d || result.buyVolumeStats1d) && (
									<div className="flex items-center gap-3 text-xs font-mono">
										{result.mc && (
											<div className="flex items-center gap-1">
												<span className="text-muted-foreground/60 uppercase tracking-wider text-[10px]">MC</span>
												<span className="font-semibold text-green-500/90">
													${formatNumberWithSuffix(result.mc)}
												</span>
											</div>
										)}
										{(result.sellVolumeStats1d || result.buyVolumeStats1d) && (
											<div className="flex items-center gap-1">
												<span className="text-muted-foreground/60 uppercase tracking-wider text-[10px]">VOL</span>
												<span className="font-semibold text-purple-500/90">
													${formatNumberWithSuffix(
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