import { constructMetadata } from "@/lib/metadata"
import RewardsContent from "./_components/rewards-content"

export const metadata = constructMetadata({
	title: "Rewards",
	description: "Earn rewards for trading, referring friends, and creating tokens",
})

const RewardPage = () => {
	return <RewardsContent />
}

export default RewardPage