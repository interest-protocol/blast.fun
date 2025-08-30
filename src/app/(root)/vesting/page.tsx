import { constructMetadata } from "@/lib/metadata"
import VestingContent from "./_components/vesting-content"

export const metadata = constructMetadata({
	title: "Token Vesting",
	description: "Lock your tokens with custom vesting periods on blast.fun - The premier token launchpad on the Sui blockchain",
})

export default function VestingPage() {
	return <VestingContent />
}