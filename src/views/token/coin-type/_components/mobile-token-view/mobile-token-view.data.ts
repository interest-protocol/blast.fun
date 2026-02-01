"use client"

import { useRouter } from "next/navigation"
import { ChartCandlestick, DollarSign, Activity, Home } from "lucide-react"
import type { MobileTab } from "./mobile-token-view.types"

export const useMobileTabs = (): MobileTab[] => {
    const router = useRouter();

    return [
        { id: "home", label: "Home", icon: Home, action: () => router.push("/") },
        { id: "chart", label: "Chart", icon: ChartCandlestick },
        { id: "trade", label: "Trade", icon: DollarSign },
        { id: "activity", label: "Activity", icon: Activity },
    ]
}
