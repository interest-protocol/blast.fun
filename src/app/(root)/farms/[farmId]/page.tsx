import { Metadata } from "next"
import FarmDetail from "@/views/farm-detail"

export const metadata: Metadata = {
	title: "Farms",
	description: "Stake your tokens and earn rewards",
}

const FarmDetailPage = async ({ params }: { params: Promise<{ farmId: string }> }) => {
	const { farmId } = await params
	return <FarmDetail farmId={farmId} />
}

export default FarmDetailPage

