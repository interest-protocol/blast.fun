"use client"

import { FC } from "react"
import { Button } from "@/components/ui/button"
import { Logo } from "@/components/ui/logo"
import { PortfolioWalletConnectProps } from "./portfolio.types"

const PortfolioWalletConnect:FC<PortfolioWalletConnectProps> = ({ openDialog }) => (
	<div className="container max-w-6xl mx-auto px-4 py-8">
		<div className="flex flex-col items-center justify-center min-h-[60vh]">
			<Logo className="w-12 h-12 mx-auto mb-4 text-foreground/20" />
			<p className="font-mono text-sm uppercase tracking-wider text-muted-foreground">
				WALLET NOT CONNECTED
			</p>
			<p className="font-mono text-xs uppercase text-muted-foreground/60 mt-2">
				CONNECT YOUR WALLET TO VIEW PORTFOLIO
			</p>
			<Button
				onClick={openDialog}
				className="font-mono uppercase tracking-wider mt-6"
				variant="outline"
			>
				CONNECT WALLET
			</Button>
		</div>
	</div>
)	

export default PortfolioWalletConnect