import { FC } from "react";

import Rewards from "@/views/rewards";
import { constructMetadata } from "@/lib/metadata";

export const metadata = constructMetadata({
	title: "Rewards",
	description: "Earn rewards for trading, referring friends, and creating tokens",
})

const RewardPage: FC = () => <Rewards/>;

export default RewardPage;