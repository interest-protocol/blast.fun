import { constructMetadata } from "@/lib/metadata"
import { AlertTriangle, Lock } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export const metadata = constructMetadata({
	title: "Launch Token - Currently Disabled",
	description: "Token launching is temporarily disabled during pre-launch testing",
})

export default function LaunchPage() {
	return (
		<div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
			<div className="max-w-md w-full p-8 border-2 border-yellow-500/20 rounded-xl bg-background/50 backdrop-blur-sm">
				<div className="flex flex-col items-center text-center space-y-6">
					{/* Icon */}
					<div className="relative">
						<Lock className="h-16 w-16 text-yellow-500/50" />
						<AlertTriangle className="h-8 w-8 text-yellow-500 absolute -bottom-2 -right-2" />
					</div>

					{/* Title */}
					<div className="space-y-2">
						<h1 className="font-mono text-2xl font-bold text-yellow-500 uppercase">
							LAUNCH::DISABLED
						</h1>
						<div className="h-px bg-yellow-500/20 w-full" />
					</div>

					{/* Message */}
					<div className="space-y-3">
						<p className="font-mono text-sm text-foreground/80">
							Token launching is temporarily disabled while we&apos;re in pre-launch testing phase.
						</p>
						<p className="font-mono text-xs text-muted-foreground">
							You can still trade existing tokens on the platform.
						</p>
					</div>

					{/* Status */}
					<div className="flex items-center gap-2 px-4 py-2 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
						<div className="h-2 w-2 rounded-full bg-yellow-500 animate-pulse" />
						<span className="font-mono text-xs text-yellow-500 uppercase">
							Pre-Launch Testing Active
						</span>
					</div>

					{/* Action */}
					<div className="flex flex-col gap-3 w-full">
						<Button 
							variant="outline" 
							className="w-full font-mono uppercase border-yellow-500/20 hover:bg-yellow-500/10"
							disabled
						>
							<Lock className="h-4 w-4 mr-2" />
							Launch Token (Coming Soon)
						</Button>
						
						<Button 
							variant="default" 
							className="w-full font-mono uppercase"
							asChild
						>
							<Link href="/">
								Browse Existing Tokens
							</Link>
						</Button>
					</div>

					{/* Footer note */}
					<p className="font-mono text-[10px] text-muted-foreground/60 uppercase">
						Follow our socials for launch updates
					</p>
				</div>
			</div>
		</div>
	)
}