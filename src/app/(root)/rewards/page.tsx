import { constructMetadata } from "@/lib/metadata"
import { RewardsContent } from "./_components/rewards-content"

export const metadata = constructMetadata({
	title: "Rewards",
	description: "Earn rewards for trading, referring friends, and creating tokens",
})

export default function RewardPage() {
	return <RewardsContent />
}