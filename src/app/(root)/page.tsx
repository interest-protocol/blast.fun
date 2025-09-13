import { Suspense } from "react"
import DiscoveryPageContent from "./page-content"
import { Loader2 } from "lucide-react"

export default function DiscoveryPage() {
	return (
		<Suspense fallback={
			<div className="flex items-center justify-center h-full">
				<Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
			</div>
		}>
			<DiscoveryPageContent />
		</Suspense>
	)
}