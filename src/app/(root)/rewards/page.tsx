import { constructMetadata } from "@/lib/metadata";
import { Logo } from "@/components/ui/logo"

export const metadata = constructMetadata({
	title: "Rewards",
});

export default function RewardsPage() {
	return (
		<div className="container max-w-2xl mx-auto flex flex-col items-center justify-center min-h-[calc(100vh-12rem)]">
			<div className="text-center">
				<Logo className="w-20 h-20 mx-auto mb-4 animate-bounce" />
				<h1 className="font-mono text-2xl font-bold uppercase tracking-wider text-foreground/80 mb-2">
					COMING::SOON
				</h1>
				<p className="font-mono text-sm uppercase text-muted-foreground">
					REWARDS_PROGRAM_UNDER_CONSTRUCTION
				</p>
			</div>
		</div>
	)
}
