import { FC } from "react";

import { constructMetadata } from "@/lib/metadata";
import Vesting from "@/views/tools/_components/vesting";

export const metadata = constructMetadata({
	title: "Token Vesting",
	description: "Lock your tokens with custom vesting periods on blast.fun - The premier token launchpad on the Sui blockchain",
})

const VestingPage: FC = () => <Vesting />;