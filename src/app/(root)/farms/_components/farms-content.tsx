"use client"

import { useApp } from "@/context/app.context"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { Logo } from "@/components/ui/logo"
import { FarmRow } from "./farm-row"
import useFarms from "../_hooks/use-farms"

export default function FarmsContent() {
	const { isConnected, setIsConnectDialogOpen } = useApp()
	const { farmsWithAccounts, isLoading } = useFarms()

	if (!isConnected) {
		return (
			<div className="container max-w-6xl mx-auto px-3 md:px-4 py-4 md:py-8">
				<div className="flex flex-col items-center justify-center min-h-[60vh]">
					<Logo className="w-12 h-12 mx-auto mb-4 text-foreground/20" />
					<p className="font-mono text-xs md:text-sm uppercase tracking-wider text-muted-foreground">
						WALLET NOT CONNECTED
					</p>
					<Button
						onClick={() => setIsConnectDialogOpen(true)}
						className="font-mono uppercase tracking-wider mt-6"
						variant="outline"
					>
						CONNECT WALLET
					</Button>
				</div>
			</div>
		)
	}

	return (
		<div className="container max-w-7xl mx-auto px-3 md:px-4 py-4 md:py-8">
			<div className="space-y-4 md:space-y-6">
				<div className="flex items-center justify-between">
					<div>
						<h1 className="font-hegarty text-xl md:text-2xl uppercase tracking-wider">Farms</h1>
						<p className="font-mono text-xs md:text-sm text-muted-foreground mt-1">
							Just stake your tokens and earn some rewards.
						</p>
					</div>
				</div>

				{isLoading ? (
					<div className="flex items-center justify-center py-16">
						<Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
					</div>
				) : farmsWithAccounts.length === 0 ? (
					<div className="flex flex-col items-center justify-center py-16 border border-border/50 rounded-lg bg-card/30">
						<p className="font-mono text-sm uppercase tracking-wider text-muted-foreground">
							No farms available
						</p>
					</div>
				) : (
					<div className="space-y-3 md:space-y-4 max-h-[calc(100vh-220px)] md:max-h-[calc(100vh-280px)] overflow-y-auto pr-1 md:pr-2">
						{farmsWithAccounts.map(({ farm, account }) => (
							<FarmRow key={farm.objectId} farm={farm} account={account} />
						))}
					</div>
				)}
			</div>
		</div>
	)
}
