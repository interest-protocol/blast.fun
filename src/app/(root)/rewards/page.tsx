import { constructMetadata } from "@/lib/metadata"
import { RewardsContent } from "./_components/rewards-content"

export const metadata = constructMetadata({
	title: "Rewards",
	description: "View and manage your Memez wallet rewards"
})

export default function RewardsPage() {
	return <RewardsContent />
}