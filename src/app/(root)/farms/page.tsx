import { FC } from "react";

import FarmsContent from "@/views/farms";
import { constructMetadata } from "@/lib/metadata";

export const metadata = constructMetadata({
	title: "Farms",
	description: "Stake eligible memecoins to earn rewards.",
})

const FarmsPage: FC = () => {
	return <FarmsContent />
}

export default FarmsPage;