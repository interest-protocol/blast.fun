import { constructMetadata } from "@/lib/metadata"
import LaunchContent from "./_components/launch-content"

export const metadata = constructMetadata({
	title: "Launch Token",
	description: "Launch your token on xPump - The premier token launchpad on the Sui blockchain",
})

export default function LaunchPage() {
	return <LaunchContent />
}