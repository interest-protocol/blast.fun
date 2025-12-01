"use client"

import { Terminal } from "lucide-react"
import { useState } from "react"
import { UseFormReturn } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { cn } from "@/utils"
import { useLaunchCoin } from "../_hooks/use-launch-coin"
import { TerminalDialog } from "./terminal-dialog"
import toast from "react-hot-toast"
import { useBalance } from "@/hooks/sui/use-balance"
import { TokenFormValues } from "./create-token-form/create-token-form.types"

interface CreateTokenButtonProps {
	form: UseFormReturn<TokenFormValues>
}

export default function CreateTokenButton({ form }: CreateTokenButtonProps) {
	const { isLaunching, logs, result, launchToken, resumeLaunch, pendingToken } = useLaunchCoin()
	const [showTerminal, setShowTerminal] = useState(false)
	const { balance } = useBalance('0x2::sui::SUI');

	const onSubmit = async (data: TokenFormValues) => {
		// Validate dev buy amount against balance
		if (data.devBuyAmount && balance) {
			const buyAmount = Number(data.devBuyAmount)
			const userBalance = Number(balance)
			
			if (buyAmount > userBalance) {
				toast.error("INSUFFICIENT::SUI::BALANCE")
				return
			}
		}

		setShowTerminal(true)
		try {
			await launchToken(data)
			form.reset()
		} catch (error) {
			// keep terminal open on error to show recovery
			console.error("Launch failed:", error)
		}
	}

	const handleResume = async () => {
		try {
			await resumeLaunch()
			form.reset()
		} catch (error) {
			console.error("Resume failed:", error)
		}
	}

	return (
		<>
			{pendingToken && !showTerminal && (
				<div className="mb-3 p-2 border border-amber-500/50 rounded bg-amber-500/5">
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-2">
							<Terminal className="h-3 w-3 text-amber-500" />
							<span className="font-mono text-xs uppercase text-amber-500">
								PENDING::LAUNCH
							</span>
						</div>
						<Button
							variant="ghost"
							size="sm"
							className="font-mono text-xs uppercase text-amber-500 hover:text-amber-400 h-6 px-2"
							onClick={() => setShowTerminal(true)}
						>
							RESUME
						</Button>
					</div>
				</div>
			)}

			<div className="relative group">
				<div className="absolute inset-0 bg-primary/10 blur-2xl rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
				<Button
					type="submit"
					className={cn(
						"relative w-full font-mono uppercase tracking-wider transition-all duration-300",
						"bg-background hover:bg-background/80 border-2 border-border"
					)}
					variant="outline"
					disabled={
						!form.formState.isValid || 
						(!!form.getValues("devBuyAmount") && !!balance && Number(form.getValues("devBuyAmount")) > Number(balance))
					}
					onClick={form.handleSubmit(onSubmit)}
				>
					<Terminal className="mr-2 h-4 w-4 transition-colors duration-300" />
					<span className="relative">INITIALIZE::DEPLOYMENT</span>
				</Button>
			</div>

			<TerminalDialog
				open={showTerminal}
				onOpenChange={setShowTerminal}
				logs={logs}
				isLaunching={isLaunching}
				result={result}
				pendingToken={pendingToken}
				onResume={handleResume}
			/>
		</>
	)
}
