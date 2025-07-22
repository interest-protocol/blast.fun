import useBalance from "@/hooks/sui/use-balance"
import { Button } from "./ui/button"
import { cn } from "@/utils"

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
				"rounded-xl px-2 !border-destructive/50 !bg-destructive/10 text-destructive [&>svg]:text-current hover:text-destructive/80",
				className
			)}
		>
			<span className="font-semibold text-sm">{balance} SUI</span>
		</Button>
	)
}

export default Balance
