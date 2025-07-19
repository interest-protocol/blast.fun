"use client"

import { UseFormReturn } from "react-hook-form"
import { Terminal } from "lucide-react"
import { TokenFormValues } from "./create-token-form"
import { Button } from "@/components/ui/button"
import { useLaunchCoin } from "../_hooks/use-launch-coin"
import { cn } from "@/utils"
import { useState } from "react"
import { TerminalDialog } from "./terminal-dialog"

interface CreateTokenButtonProps {
	form: UseFormReturn<TokenFormValues>
}

export default function CreateTokenButton({ form }: CreateTokenButtonProps) {
	const { isLaunching, logs, result, launchToken } = useLaunchCoin()
	const [showTerminal, setShowTerminal] = useState(false)

	const onSubmit = async (data: TokenFormValues) => {
		setShowTerminal(true)
		await launchToken(data)
		form.reset()
	}

	return (
		<>
			<div className="relative group">
				<div className="absolute inset-0 bg-primary/10 blur-2xl rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
				<Button
					type="submit"
					className={cn(
						"relative w-full font-mono uppercase tracking-wider transition-all duration-300",
						"bg-background hover:bg-background/80 border-2 border-border"
					)}
					variant="outline"
					disabled={!form.formState.isValid}
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
			/>
		</>
	)
}
