import { FC } from "react"
import { Search } from "lucide-react"

import { Logo } from "@/components/ui/logo"
import TokenItem from "../token-item"
import { SearchResultsProps } from "./search-results.types"

const SearchResults: FC<SearchResultsProps> = ({ loading, error, searched, tokens }) => {
  if (loading) {
    return (
      <div className="p-12 text-center">
        <Logo className="w-12 h-12 mx-auto text-foreground/20 mb-4 animate-pulse" />
        <p className="font-mono text-sm uppercase text-muted-foreground">Searching...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-12 text-center">
        <Logo className="w-12 h-12 mx-auto text-foreground/20 mb-4" />
        <p className="font-mono text-sm uppercase text-destructive mb-2">{error}</p>
      </div>
    )
  }

  if (!searched) {
    return (
      <div className="p-12 text-center">
        <Search className="w-12 h-12 mx-auto text-foreground/20 mb-4" />
        <p className="font-mono text-sm uppercase text-muted-foreground">
          Enter a creator address to search
        </p>
      </div>
    )
  }

  if (tokens.length === 0) {
    return (
      <div className="p-12 text-center">
        <Logo className="w-12 h-12 mx-auto text-foreground/20 mb-4" />
        <p className="font-mono text-sm uppercase text-muted-foreground">No tokens found</p>
      </div>
    )
  }

  return (
    <div>
      <div className="p-4 border-b border-border/50">
        <p className="font-mono text-xs uppercase text-muted-foreground">
          Found {tokens.length} token(s)
        </p>
      </div>

      <div className="divide-y divide-border/30">
        {tokens.map((token) => (
          <TokenItem key={token.coinType} token={token} />
        ))}
      </div>
    </div>
  )
}

export default SearchResults
