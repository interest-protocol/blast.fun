import { TokenWithMetadata } from "../../_hooks/use-search-creator"

export interface SearchResultsProps {
  loading: boolean
  error: string | null
  searched: boolean
  tokens: TokenWithMetadata[]
}