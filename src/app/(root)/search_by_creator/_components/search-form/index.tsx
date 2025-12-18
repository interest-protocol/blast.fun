"use client"

import { FC } from "react"
import { Search, Loader2 } from "lucide-react"

import { cn } from "@/utils/index"
import { SearchFormProps } from "./search-form.types"

const SearchForm: FC<SearchFormProps> = ({ query, setQuery, loading, onSubmit }) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit()
  }

  return (
    <form onSubmit={handleSubmit} className="mb-8">
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
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Search"}
        </button>
      </div>
    </form>
  )
}

export default SearchForm
