import { use } from "react"
import TokenLayout from "./_components/token-layout"

export default function PoolPage({ params }: { params: Promise<{ id: string }> }) {
	const { id } = use(params)

	return <TokenLayout poolId={id} />
}