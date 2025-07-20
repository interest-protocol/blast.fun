import useBalance from "@/hooks/sui/use-balance"
import { Button } from "./ui/button"

const Balance = () => {
	const { balance } = useBalance({ autoRefetch: true })

	if (balance == null) {
		return <></>
	}

	return (
		<Button
			variant="outline"
			className="rounded-xl px-2 !border-destructive/50 !bg-destructive/10 text-destructive [&>svg]:text-current hover:text-destructive/80"
		>
			<span className="font-semibold text-sm">{balance} SUI</span>
		</Button>
	)
}

export default Balance
