"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, AlertCircle } from "lucide-react"
import { isValidSuiAddress } from "@mysten/sui/utils"

interface TransferPositionDialogProps {
	open: boolean
	onOpenChange: (open: boolean) => void
	tokenSymbol?: string
	onConfirm: (address: string) => Promise<boolean>
}

export function TransferPositionDialog({
	open,
	onOpenChange,
	tokenSymbol,
	onConfirm
}: TransferPositionDialogProps) {
	const [recipientAddress, setRecipientAddress] = useState("")
	const [isTransferring, setIsTransferring] = useState(false)
	const [error, setError] = useState("")

	const handleTransfer = async () => {
		if (!recipientAddress.trim()) {
			setError("Please enter a recipient address")
			return
		}

		if (!isValidSuiAddress(recipientAddress.trim())) {
			setError("Invalid Sui address")
			return
		}

		setIsTransferring(true)
		setError("")

		try {
			const success = await onConfirm(recipientAddress.trim())
			if (success) {
				onOpenChange(false)
				setRecipientAddress("")
			}
		} catch (err) {
			console.error("Transfer failed:", err)
			setError("Transfer failed. Please try again.")
		} finally {
			setIsTransferring(false)
		}
	}

	const handleClose = () => {
		if (!isTransferring) {
			onOpenChange(false)
			setRecipientAddress("")
			setError("")
		}
	}

	return (
		<Dialog open={open} onOpenChange={handleClose}>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>Transferring ${tokenSymbol || "Position"}</DialogTitle>
					<DialogDescription>
						Transfer ownership to another wallet address, this cannot be undone.
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-3 py-3">
					<div className="space-y-1.5">
						<Label htmlFor="recipient" className="text-muted-foreground text-sm">Recipient Address</Label>
						<Input
							id="recipient"
							placeholder="0x..."
							value={recipientAddress}
							onChange={(e) => {
								setRecipientAddress(e.target.value)
								setError("")
							}}
							disabled={isTransferring}
							className="font-mono text-sm"
						/>

						{error && (
							<div className="flex items-center gap-1.5 text-xs text-destructive">
								<AlertCircle className="size-3.5" />
								{error}
							</div>
						)}
					</div>
				</div>

				<DialogFooter>
					<Button
						variant="outline"
						onClick={handleClose}
						disabled={isTransferring}
						size="sm"
					>
						Cancel
					</Button>
					<Button
						onClick={handleTransfer}
						disabled={isTransferring || !recipientAddress.trim()}
						size="sm"
					>
						{isTransferring ? (
							<>
								<Loader2 className="mr-2 h-4 w-4 animate-spin" />
								Transferring...
							</>
						) : (
							"Transfer"
						)}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	)
}
