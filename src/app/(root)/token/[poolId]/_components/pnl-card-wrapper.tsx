"use client"

import dynamic from "next/dynamic"
import type { PoolWithMetadata } from "@/types/pool"

const PnlCard = dynamic(
  () => import("./pnl-card").then((mod) => mod.PnlCard),
  { 
    ssr: false,
    loading: () => null 
  }
)

interface PnlCardWrapperProps {
  pool: PoolWithMetadata
}

export function PnlCardWrapper({ pool }: PnlCardWrapperProps) {
  return <PnlCard pool={pool} />
}