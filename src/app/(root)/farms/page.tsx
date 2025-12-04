import { constructMetadata } from "@/lib/metadata"
import FarmsContent from "./_components/farms-content"

export const metadata = constructMetadata({
	title: "Farms",
	description: "Stake eligible memecoins to earn rewards.",
})

const FarmsPage = () => {
	return <FarmsContent />
}

export default FarmsPage