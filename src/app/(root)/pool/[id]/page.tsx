import { use } from "react"
import Pool from "./_components/pool"

export default async function PoolPage({ params }: { params: Promise<{ id: string }> }) {
	const { id } = use(params)

	return <Pool poolId={id} />
}