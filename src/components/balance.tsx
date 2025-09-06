import useBalance from "@/hooks/sui/use-balance"
import { cn } from "@/utils"
import { Button } from "./ui/button"

interface BalanceProps {
	className?: string
}

const Balance = ({ className }: BalanceProps) => {
	const { balance } = useBalance({ autoRefetch: true })

	if (balance == null) {
		return <></>
	}

	return (
		<Button
			variant="outline"
			className={cn(
				"!border-destructive/50 !bg-destructive/10 rounded-xl px-2 text-destructive hover:text-destructive/80 [&>svg]:text-current",
				className
			)}
		>
			<span className="font-semibold text-sm">{balance} SUI</span>
		</Button>
	)
}

export default Balance
