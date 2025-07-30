"use client"

import { ExternalLink } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import Balance from "@/components/balance"
import { UserDropdown } from "@/components/user/user-dropdown"
import { useApp } from "@/context/app.context"
import { Logo } from "@/components/ui/logo"
import type { PoolWithMetadata } from "@/types/pool"

interface EmbedHeaderProps {
	pool?: PoolWithMetadata
	refCode?: string | null
}

export function EmbedHeader({ pool, refCode }: EmbedHeaderProps) {
	const { isConnected } = useApp()
	const metadata = pool?.coinMetadata

	const openInNewTab = () => {
		if (pool) {
			const url = refCode
				? `${window.location.origin}/meme/${pool.poolId}?ref=${refCode}`
				: `${window.location.origin}/meme/${pool.poolId}`
			window.open(url, "_blank")
		}
	}

	return (
		<header className="border-b border-foreground/20 bg-background/90 backdrop-blur">
			<div className="flex items-center justify-between px-3 py-2">
				<div className="flex items-center gap-2 select-none">
					{pool ? (
						<>
							<Avatar className="w-8 h-8 border border-foreground/20">
								<AvatarImage src={metadata?.iconUrl || ""} alt={metadata?.symbol} />
								<AvatarFallback className="bg-foreground/10 text-foreground/80 font-mono text-xs">
									{metadata?.symbol?.slice(0, 2) || "??"}
								</AvatarFallback>
							</Avatar>
							<div>
								<div className="flex items-center gap-2">
									<h1 className="font-mono text-xs font-bold uppercase tracking-wider text-foreground/80">
										{metadata?.symbol || "[UNKNOWN]"}
									</h1>
								</div>
								<p className="font-mono text-[10px] text-muted-foreground uppercase">
									{metadata?.name || "[UNNAMED]"}
								</p>
							</div>
						</>
					) : (
						<div className="flex items-center gap-2 select-none">
							<Logo className="h-6 w-6 text-foreground/60" />
							<span className="font-mono font-bold text-sm uppercase tracking-wider text-foreground/80">
								XPUMP.FUN
							</span>
						</div>
					)}
				</div>

				<div className="flex items-center gap-2">
					{isConnected && (
						<Balance />
					)}
					<UserDropdown />
					{pool && (
						<Button
							variant="ghost"
							size="icon"
							onClick={openInNewTab}
							className="h-7 w-7 text-foreground/60 hover:text-foreground/80 hover:bg-foreground/10"
						>
							<ExternalLink className="w-3.5 h-3.5" />
						</Button>
					)}
				</div>
			</div>
		</header>
	)
}