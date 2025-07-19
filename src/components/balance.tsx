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
			className="rounded-xl px-2 !bg-orange-400/20 !border-orange-400 ease-in-out duration-300 transition-all"
		>
			<span className="dark:text-orange-200 text-orange-400 group-hover:text-primary transition-colors duration-300 font-semibold text-sm">
				{balance} SUI
			</span>
		</Button>
	)
}

export default Balance
