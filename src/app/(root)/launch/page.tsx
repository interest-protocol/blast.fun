import { FC } from "react"

import Launch from "@/views/launch"
import { constructMetadata } from "@/lib/metadata"

export const metadata = constructMetadata({
	title: "Launch Token",
	description: "Launch your token on blast.fun - The premier token launchpad on the Sui blockchain",
})

const LaunchPage: FC = () => {
	return <Launch />
}

export default LaunchPage;