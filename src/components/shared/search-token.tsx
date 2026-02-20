"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Search, Loader2 } from "lucide-react";
import { useDebouncedCallback } from "use-debounce";
import {
    CommandDialog,
    CommandEmpty,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import { TokenAvatar } from "@/components/tokens/token-avatar";
import { formatNumberWithSuffix } from "@/utils/format";

interface SearchResult {
    type: "coin";
    icon?: string;
    symbol: string;
    name: string;
    coinType: string;
    mc?: number;
    holderScore?: number;
    price?: number;
    coinMetadata?: {
        iconUrl?: string;
        icon_url?: string;
    };
    sellVolumeStats1d?: {
        volumeUsd: number;
    };
    buyVolumeStats1d?: {
        volumeUsd: number;
    };
}

interface SearchTokenProps {
    mode?: "tab" | "header";
}

export function SearchToken({ mode = "tab" }: SearchTokenProps) {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState("");
    const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const isMac =
        typeof window !== "undefined" &&
        navigator.platform.toUpperCase().indexOf("MAC") >= 0;
    const shortcutKey = isMac ? "⌘" : "Ctrl";

    const handleSearch = useDebouncedCallback(async (searchQuery: string) => {
        if (!searchQuery || searchQuery.length < 2) {
            setSearchResults([]);
            return;
        }

        try {
            setLoading(true);
            setSearchResults([]);
        } catch (error) {
            console.error("Search error:", error);
            setSearchResults([]);
        } finally {
            setLoading(false);
        }
    }, 500);

    useEffect(() => {
        handleSearch(query);
    }, [query, handleSearch]);

    const handleSelect = useCallback(
        (coinType: string) => {
            router.push(`/token/${coinType}`);
            setOpen(false);
            setQuery("");
            setSearchResults([]);
        },
        [router]
    );

    useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === "f" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setOpen((open) => !open);
            }
        };

        document.addEventListener("keydown", down);
        return () => document.removeEventListener("keydown", down);
    }, []);

    return (
        <>
            {mode === "header" ? (
                <Button
                    variant="outline"
                    className="rounded-lg group px-2 min-w-[15rem] ease-in-out duration-300 transition-all gap-1.5 flex justify-between"
                    onClick={() => setOpen(true)}
                >
                    <Search className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition-colors duration-300" />
                    <span className="text-xs font-semibold text-muted-foreground group-hover:text-primary transition-colors duration-300">
                        Search Token
                    </span>
                    <span className="flex py-1 px-2 bg-[#0004] rounded-md items-center text-[10px] font-mono text-muted-foreground/60 group-hover:text-muted-foreground transition-colors duration-300 tracking-widest">
                        {shortcutKey}+F
                    </span>
                </Button>
            ) : (
                <Button
                    size="sm"
                    variant="outline"
                    className="rounded-lg group px-2 ease-in-out duration-300 transition-all gap-1.5"
                    onClick={() => setOpen(true)}
                >
                    <Search className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition-colors duration-300" />
                    <span className="text-xs font-semibold text-muted-foreground group-hover:text-primary transition-colors duration-300">
                        Search
                    </span>
                </Button>
            )}

            <CommandDialog
                open={open}
                onOpenChange={(isOpen) => {
                    setOpen(isOpen);
                    if (!isOpen) {
                        setQuery("");
                        setSearchResults([]);
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
                    {query.length >= 2 &&
                        !loading &&
                        searchResults.length === 0 && (
                            <CommandEmpty>No tokens found.</CommandEmpty>
                        )}

                    {searchResults.map((result) => (
                        <CommandItem
                            key={result.coinType}
                            onSelect={() => handleSelect(result.coinType)}
                            className="flex rounded-lg items-center gap-3 px-4 py-3 cursor-pointer"
                        >
                            <TokenAvatar
                                iconUrl={
                                    result.icon ||
                                    result.coinMetadata?.iconUrl ||
                                    result.coinMetadata?.icon_url
                                }
                                symbol={result.symbol}
                                name={result.name}
                                className="w-10 h-10 rounded-lg"
                            />
                            <div className="flex flex-col flex-1">
                                <div className="flex items-center gap-2">
                                    <span className="font-mono font-bold text-sm uppercase tracking-wider text-foreground/90">
                                        {result.symbol}
                                    </span>
                                    <span className="text-xs text-muted-foreground truncate">
                                        {result.name}
                                    </span>
                                </div>
                                {(result.mc ||
                                    result.sellVolumeStats1d ||
                                    result.buyVolumeStats1d) && (
                                    <div className="flex items-center gap-3 text-xs font-mono">
                                        {result.mc && (
                                            <div className="flex items-center gap-1">
                                                <span className="text-muted-foreground/60 uppercase tracking-wider text-[10px]">
                                                    MC
                                                </span>
                                                <span className="font-semibold text-green-500/90">
                                                    $
                                                    {formatNumberWithSuffix(
                                                        result.mc
                                                    )}
                                                </span>
                                            </div>
                                        )}
                                        {(result.sellVolumeStats1d ||
                                            result.buyVolumeStats1d) && (
                                            <div className="flex items-center gap-1">
                                                <span className="text-muted-foreground/60 uppercase tracking-wider text-[10px]">
                                                    VOL
                                                </span>
                                                <span className="font-semibold text-purple-500/90">
                                                    $
                                                    {formatNumberWithSuffix(
                                                        (result
                                                            .sellVolumeStats1d
                                                            ?.volumeUsd || 0) +
                                                            (result
                                                                .buyVolumeStats1d
                                                                ?.volumeUsd ||
                                                                0)
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
    );
}
