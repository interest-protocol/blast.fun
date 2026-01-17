import { SortBy, TimeRange } from "@/hooks/use-leaderboard"

export interface CycleSelectorProps {
  currentCycle: number
  selectedCycle: number | undefined
  availableCycles: number[]
  onCycleChange: (cycle: number) => void
  loading: boolean
  getCycleDateRange: (cycle: number) => string
}

export interface LeaderboardControlsProps {
  timeRange: TimeRange
  onTimeRangeChange: (range: TimeRange) => void
  loading: boolean
  copied: boolean
  onCopy: () => void
  onExport: () => void
  dataEmpty: boolean
  cycleSelector?: React.ReactNode
}

export interface LeaderboardEmptyProps {
  title?: string
  subtitle?: string
}

export interface LeaderboardHeaderProps {
  sortBy: SortBy
  onSort: (field: SortBy) => void
}

export interface LeaderboardRowProps {
  rank: number
  user: string
  totalVolume: number
  tradeCount: number
  suinsName?: string | null
}

export interface LeaderboardEntry {
  user: string
  rank?: number
  totalVolume: number
  tradeCount: number
}

export interface LeaderboardTableProps {
  data: LeaderboardEntry[]
  suinsNames?: Record<string, string | null> | undefined,
  sortBy: SortBy
  onSort: (field: SortBy) => void
  hasMore: boolean
  loadingMore: boolean
  onLoadMore: () => void
}
