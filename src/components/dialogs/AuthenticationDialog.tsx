import { useApp } from "@/context/app.context"
import { WalletList } from "../shared/wallet-list"
import { Button } from "../ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog"

export function AuthenticationDialog() {
	const {
		isConnecting,

		isConnectDialogOpen,
		setIsConnectDialogOpen,

		connect,
	} = useApp()

	return (
		<Dialog open={isConnectDialogOpen} onOpenChange={setIsConnectDialogOpen}>
			<DialogTrigger asChild>
				<Button variant="outline" className="rounded-xl" disabled={isConnecting}>
					Connect Wallet
				</Button>
			</DialogTrigger>

			<DialogContent className="flex max-w-md flex-col gap-0 overflow-hidden rounded-xl border-border/50 p-0 shadow-xl">
				<div className="flex w-full flex-col gap-4 p-6">
					<DialogHeader className="text-center">
						<DialogTitle className="font-bold text-xl">Connect to BLAST.FUN</DialogTitle>
						<DialogDescription className="text-sm">
							Connect with one of the available wallet providers or create a new wallet.
						</DialogDescription>
					</DialogHeader>

					<WalletList onSelect={connect} isConnecting={isConnecting} />
				</div>
			</DialogContent>
		</Dialog>
	)
}
