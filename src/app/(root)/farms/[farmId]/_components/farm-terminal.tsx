"use client"

import { useState } from "react"
import { Loader2, Wallet } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useApp } from "@/context/app.context"
import { useBalance } from "@/hooks/sui/use-balance"
import type { InterestFarm, InterestAccount } from "@interest-protocol/farms"
import type { CoinMetadata } from "@/lib/interest-protocol-api"
import { cn } from "@/utils"
import { formatNumberWithSuffix } from "@/utils/format"
import { useFarmOperations } from "../_hooks/use-farm-operations"
import { TokenAvatar } from "@/components/tokens/token-avatar"

interface FarmTerminalProps {
	farm: InterestFarm
	account?: InterestAccount
	metadata: CoinMetadata | null
	onOperationSuccess: () => void
}

export function FarmTerminal({ farm, account, metadata, onOperationSuccess }: FarmTerminalProps) {
	const { isConnected, setIsConnectDialogOpen } = useApp()
	const [actionType, setActionType] = useState<"deposit" | "withdraw">("deposit")
	const [amount, setAmount] = useState("")

	const { balance: tokenBalance } = useBalance(farm.stakeCoinType)
	const tokenBalanceBigInt = BigInt(tokenBalance || "0")
	const tokenBalanceInDisplayUnit = Number(tokenBalanceBigInt) / 1e9

	const rewardCoinType = farm.rewardTypes[0] || ""
	const staked = account?.stakeBalance || 0n
	const stakedInDisplayUnit = Number(staked) / 1e9

	const tokenSymbol = metadata?.symbol || "TOKEN"

	const { stake, unstake, isStaking, isUnstaking } = useFarmOperations({
		farmId: farm.objectId,
		stakeCoinType: farm.stakeCoinType,
		rewardCoinType,
		account,
		tokenSymbol,
		onSuccess: () => {
			setAmount("")
			onOperationSuccess()
		},
	})

	const handleDeposit = async () => {
		if (!amount || parseFloat(amount) <= 0) return
		await stake(amount)
	}

	const handleWithdraw = async () => {
		if (!amount || parseFloat(amount) <= 0) return
		await unstake(amount)
	}

	const handleMaxClick = () => {
		if (actionType === "deposit") {
			if (tokenBalanceInDisplayUnit <= 0) {
				setAmount("0")
				return
			}
			setAmount(tokenBalanceInDisplayUnit.toString())
		} else {
			if (stakedInDisplayUnit <= 0) {
				setAmount("0")
				return
			}
			setAmount(stakedInDisplayUnit.toString())
		}
	}

	const handleQuickAmount = (percentage: number) => {
		const balance = actionType === "deposit" ? tokenBalanceInDisplayUnit : stakedInDisplayUnit
		if (balance <= 0) {
			setAmount("0")
			return
		}
		const calculatedAmount = (balance * percentage) / 100
		setAmount(calculatedAmount.toString())
	}

	if (!isConnected) {
		return (
			<div className="p-4">
				<div className="text-center space-y-2">
					<Wallet className="w-8 h-8 text-muted-foreground mx-auto" />
					<p className="font-mono text-xs text-muted-foreground">Connect wallet to stake</p>
					<Button
						onClick={() => setIsConnectDialogOpen(true)}
						className="font-mono uppercase tracking-wider mt-4"
						size="sm"
					>
						Connect Wallet
					</Button>
				</div>
			</div>
		)
	}

	const isProcessing = isStaking || isUnstaking

	return (
		<div className="p-4 space-y-4">
			{/* Deposit/Withdraw Tabs */}
			<div className="grid grid-cols-2 gap-1 p-1 bg-muted/30 rounded-lg">
				<button
					onClick={() => setActionType("deposit")}
					className={cn(
						"py-2.5 rounded-md font-mono text-xs uppercase transition-all",
						actionType === "deposit"
							? "bg-green-500/20 text-green-500 border border-green-500/50"
							: "hover:bg-muted/50 text-muted-foreground"
					)}
				>
					Deposit
				</button>
				<button
					onClick={() => setActionType("withdraw")}
					disabled={stakedInDisplayUnit === 0}
					className={cn(
						"py-2.5 rounded-md font-mono text-xs uppercase transition-all",
						actionType === "withdraw"
							? "bg-red-500/20 text-red-500 border border-red-500/50"
							: "hover:bg-muted/50 text-muted-foreground",
						stakedInDisplayUnit === 0 && "opacity-50 cursor-not-allowed"
					)}
				>
					Withdraw
				</button>
			</div>

			{/* Input Section */}
			<div className="border rounded-lg p-6 space-y-6 bg-muted/5">
				{/* Header */}
				<div className="flex justify-between items-center text-sm">
					<div className="flex items-center gap-2 text-muted-foreground">
						<Wallet className="h-4 w-4" />
						<span className="font-mono">Balance</span>
					</div>
					<div className="flex items-center gap-2">
						<span className="text-foreground font-mono font-semibold">
							{actionType === "deposit" ? formatNumberWithSuffix(tokenBalanceInDisplayUnit) : formatNumberWithSuffix(stakedInDisplayUnit)}
						</span>
						<span className="text-muted-foreground font-mono">{tokenSymbol}</span>
						<button
							onClick={handleMaxClick}
							className="text-blue-400 hover:text-blue-300 font-medium text-xs transition-colors font-mono"
							disabled={isProcessing}
						>
							MAX
						</button>
					</div>
				</div>

				{/* Input */}
				<div className="space-y-4">
					<div className="flex items-center gap-2">
						<input
							type="text"
							placeholder="0.00"
							value={amount}
							onChange={(e) => setAmount(e.target.value)}
							className="flex-1 bg-transparent text-3xl font-medium outline-none placeholder:text-muted-foreground/50 text-foreground min-w-0"
							disabled={isProcessing}
							inputMode="decimal"
						/>
						<div className="flex items-center gap-2 px-4 py-3 bg-muted/20 rounded-md border border-border/50 shrink-0">
							<TokenAvatar
								iconUrl={metadata?.iconUrl}
								symbol={tokenSymbol}
								className="w-6 h-6 rounded-full"
								enableHover={false}
							/>
							<span className="text-base font-medium whitespace-nowrap">{tokenSymbol}</span>
						</div>
					</div>

					{/* Quick Actions */}
					<div className="flex justify-end gap-2">
						{[25, 50, 75, 100].map((percentage) => (
							<button
								key={percentage}
								className={cn(
									"py-2 px-3 rounded-md flex justify-center items-center",
									"border border-blue-500/30 bg-blue-500/10 hover:bg-blue-500/20",
									"transition-all duration-200",
									"group",
									(isProcessing || (actionType === "withdraw" && stakedInDisplayUnit === 0)) && "opacity-50 cursor-not-allowed"
								)}
								onClick={() => handleQuickAmount(percentage)}
								disabled={isProcessing || (actionType === "withdraw" && stakedInDisplayUnit === 0)}
							>
								<span className="text-xs font-semibold text-blue-400 group-hover:text-blue-300 whitespace-nowrap">
									{percentage}%
								</span>
							</button>
						))}
					</div>
				</div>
			</div>


			<Button
				className={cn(
					"w-full h-10 font-mono text-xs uppercase",
					actionType === "deposit"
						? "bg-green-400/50 hover:bg-green-500/90 text-foreground"
						: "bg-destructive/80 hover:bg-destructive text-foreground",
					(!amount || isProcessing || (actionType === "withdraw" && stakedInDisplayUnit === 0)) && "opacity-50"
				)}
				onClick={actionType === "deposit" ? handleDeposit : handleWithdraw}
				disabled={
					!amount ||
					isProcessing ||
					(actionType === "deposit" && parseFloat(amount) > tokenBalanceInDisplayUnit) ||
					(actionType === "withdraw" && (stakedInDisplayUnit === 0 || parseFloat(amount) > stakedInDisplayUnit))
				}
			>
				{isProcessing ? (
					<>
						<Loader2 className="h-3.5 w-3.5 animate-spin mr-2" />
						{actionType === "deposit" ? "Depositing..." : "Withdrawing..."}
					</>
				) : (
					<>
						{actionType === "deposit"
							? `Deposit ${formatNumberWithSuffix(parseFloat(amount) || 0)} ${tokenSymbol}`
							: `Withdraw ${formatNumberWithSuffix(parseFloat(amount) || 0)} ${tokenSymbol}`}
					</>
				)}
			</Button>
		</div>
	)
}
