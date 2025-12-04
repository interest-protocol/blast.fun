"use client"

import { useState, useMemo, useEffect, FC } from "react"
import { useRouter, useSearchParams } from "next/navigation"

import {
  copyToClipboard,
  exportToCSV,
  getAvailableCycles,
  getCurrentCycle,
  getCycleDateRange
} from "./_components/leaderboard-utils"
import { useSuiNSNames } from "@/hooks/use-suins"
import LeaderboardError from "./_components/leaderboard-error"
import LeaderboardEmpty from "./_components/leaderboard-empty"
import LeaderboardTable from "./_components/leaderboard-table"
import LeaderboardControls from "./_components/leaderboard-controls"
import LeaderboardSkeleton from "./_components/leaderboard-skeleton"
import { useLeaderboard, type TimeRange, type SortBy } from "@/hooks/use-leaderboard"
import CycleSelector from "./_components/cycle-selector"

const LeaderboardContent: FC = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [timeRange, setTimeRange] = useState<TimeRange>("24h")
  const [initialSort, setInitialSort] = useState<SortBy>("volume")
  const [copied, setCopied] = useState(false)
  const [cycleNumber, setCycleNumber] = useState<number | undefined>(undefined)

  const now = Date.now()
  const currentCycleNumber = getCurrentCycle(now)
  const availableCycles = getAvailableCycles(currentCycleNumber)

  // @dev: Read sort, range, and cycle from URL on mount
  useEffect(() => {
    const sortParam = searchParams.get("sort")
    const rangeParam = searchParams.get("range")
    const cycleParam = searchParams.get("cycle")

    if (sortParam === "volume" || sortParam === "trades") {
      setInitialSort(sortParam as SortBy)
    }
    if (rangeParam === "24h" || rangeParam === "7d" || rangeParam === "14d" || rangeParam === "all") {
      setTimeRange(rangeParam as TimeRange)
    }
    if (cycleParam) {
      setCycleNumber(Number.parseInt(cycleParam))
    }
  }, [searchParams])

  const {
    data,
    loading,
    loadingMore,
    error,
    sortBy,
    handleSort: baseHandleSort,
    hasMore,
    loadMore,
  } = useLeaderboard({
    timeRange,
    initialSort,
    pageSize: 100,
    cycleNumber: timeRange === "14d" ? cycleNumber : undefined,
  })

  const handleSort = (field: SortBy) => {
    baseHandleSort(field)
    const params = new URLSearchParams(searchParams.toString())
    params.set("sort", field)
    router.push(`/leaderboard?${params.toString()}`)
  }

  const handleTimeRangeChange = (range: TimeRange) => {
    setTimeRange(range)
    const params = new URLSearchParams(searchParams.toString())
    params.set("range", range)
    if (range === "14d") {
      setCycleNumber(undefined)
      params.delete("cycle")
    }
    router.push(`/leaderboard?${params.toString()}`)
  }

  const handleCycleChange = (cycle: number) => {
    setCycleNumber(cycle)
    const params = new URLSearchParams(searchParams.toString())
    params.set("cycle", cycle.toString())
    router.push(`/leaderboard?${params.toString()}`)
  }

  const traderAddresses = useMemo(() => {
    return data.map((entry) => entry.user) || []
  }, [data])

  const { data: suinsNames } = useSuiNSNames(traderAddresses)

  const handleExportCSV = () => {
    exportToCSV(data, suinsNames, timeRange, cycleNumber)
  }

  const handleCopyTSV = async () => {
    copyToClipboard(
      data,
      suinsNames,
      () => {
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      },
      (err) => {
        console.error("Failed to copy to clipboard:", err)
      },
    )
  }

  const cycleSelectorComponent = timeRange === "14d" && availableCycles.length > 0 && (
    <CycleSelector
      currentCycle={currentCycleNumber}
      selectedCycle={cycleNumber}
      availableCycles={availableCycles}
      onCycleChange={handleCycleChange}
      loading={loading}
      getCycleDateRange={getCycleDateRange}
    />
  )

  return (
    <div className="container max-w-7xl mx-auto py-4">
      <LeaderboardControls
        timeRange={timeRange}
        onTimeRangeChange={handleTimeRangeChange}
        loading={loading}
        copied={copied}
        onCopy={handleCopyTSV}
        onExport={handleExportCSV}
        dataEmpty={data.length === 0}
        cycleSelector={cycleSelectorComponent}
      />

      <div className="bg-card/50 border border-border/50 rounded-lg overflow-hidden">
        {loading ? (
          <LeaderboardSkeleton />
        ) : error ? (
          <LeaderboardError />
        ) : data.length === 0 ? (
          <LeaderboardEmpty />
        ) : (
          <LeaderboardTable
            data={data}
            suinsNames={suinsNames}
            sortBy={sortBy}
            onSort={handleSort}
            hasMore={hasMore}
            loadingMore={loadingMore}
            onLoadMore={loadMore}
          />
        )}
      </div>
    </div>
  )
}

export default LeaderboardContent;