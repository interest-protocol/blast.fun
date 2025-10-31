import { Suspense } from "react"
import { constructMetadata } from "@/lib/metadata"
import VestingContent from "./_components/vesting-content"
import { Loader2 } from "lucide-react"

export const metadata = constructMetadata({
	title: "Token Vesting",
	description: "Lock your tokens with custom vesting periods on blast.fun - The premier token launchpad on the Sui blockchain",
})

export default function VestingPage() {
	return (
		<Suspense fallback={
			<div className="flex items-center justify-center min-h-screen">
				<Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
			</div>
		}>
			<VestingContent />
		</Suspense>
	)
}