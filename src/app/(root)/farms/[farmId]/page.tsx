import { Metadata } from "next"
import { FarmDetail } from "./_components/farm-detail"

export const metadata: Metadata = {
	title: "Farm | XPUMP",
	description: "Stake your tokens and earn rewards",
}

export default async function FarmDetailPage({ params }: { params: Promise<{ farmId: string }> }) {
	const { farmId } = await params
	return <FarmDetail farmId={farmId} />
}
