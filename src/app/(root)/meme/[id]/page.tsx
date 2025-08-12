import { use } from "react"
import TokenLayout from "./_components/token-layout"

export default function PoolPage({ 
	params,
	searchParams 
}: { 
	params: Promise<{ id: string }>
	searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
	const { id } = use(params)
	const search = use(searchParams)
	const referral = search?.ref as string | undefined

	return <TokenLayout poolId={id} referral={referral} />
}