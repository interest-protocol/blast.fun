"use client"

import { useEffect, useState } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CreateVesting } from "./create-vesting"
import { VestingPositions } from "./vesting-positions"

export default function VestingContent() {
	const searchParams = useSearchParams()
	const router = useRouter()
	const pathname = usePathname()
	const [activeTab, setActiveTab] = useState<string>()
	const [shouldRefresh, setShouldRefresh] = useState(false)
	const coinType = searchParams.get("coin_type")

	useEffect(() => {
		const tabParam = searchParams.get("tab")
		if (tabParam === "create" || tabParam === "my_positions") {
			setActiveTab(tabParam === "my_positions" ? "positions" : tabParam)
		} else {
			setActiveTab("create")
		}
	}, [searchParams])

	const handleTabChange = (value: string) => {
		setActiveTab(value)
		const urlTab = value === "positions" ? "my_positions" : value
		const params = new URLSearchParams(searchParams)
		params.set("tab", urlTab)
		// @dev: Preserve coin_type parameter when switching tabs
		if (coinType) {
			params.set("coin_type", coinType)
		}
		router.replace(`${pathname}?${params.toString()}`)
	}

	const switchToPositionsTab = () => {
		handleTabChange("positions")
	}

	const handleVestingCreated = () => {
		switchToPositionsTab()
		// @dev: Trigger a refresh of positions after 3 seconds
		setTimeout(() => {
			setShouldRefresh(true)
		}, 3000)
	}

	if (!activeTab) {
		return null
	}

	return (
		<div className="flex justify-center py-8">
			<div className="w-full max-w-4xl px-4">
				<div className="mb-8">
					<h1 className="font-bold text-3xl">Token Vesting</h1>
					<p className="mt-2 text-muted-foreground">
						Lock your tokens with custom vesting periods
					</p>
				</div>

				<Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
					<TabsList className="grid w-full grid-cols-2">
						<TabsTrigger value="create">Create Vesting</TabsTrigger>
						<TabsTrigger value="positions">My Positions</TabsTrigger>
					</TabsList>

					<TabsContent value="create" className="mt-6">
						<CreateVesting onVestingCreated={handleVestingCreated} initialCoinType={coinType} />
					</TabsContent>

					<TabsContent value="positions" className="mt-6">
						<VestingPositions shouldRefresh={shouldRefresh} onRefreshed={() => setShouldRefresh(false)} />
					</TabsContent>
				</Tabs>
			</div>
		</div>
	)
}