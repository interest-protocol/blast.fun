"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, AlertCircle } from "lucide-react"
import { isValidSuiAddress } from "@mysten/sui/utils"
import { formatAddress } from "@mysten/sui/utils"

interface TransferPositionDialogProps {
	open: boolean
	onOpenChange: (open: boolean) => void
	positionId: string
	tokenSymbol?: string
	onConfirm: (address: string) => Promise<boolean>
}

export function TransferPositionDialog({
	open,
	onOpenChange,
	positionId,
	tokenSymbol,
	onConfirm
}: TransferPositionDialogProps) {
	const [recipientAddress, setRecipientAddress] = useState("")
	const [isTransferring, setIsTransferring] = useState(false)
	const [error, setError] = useState("")

	const handleTransfer = async () => {
		// @dev: Validate address
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
					<DialogTitle>Transfer Position</DialogTitle>
					<DialogDescription>
						Transfer ownership of this creator reward position to another address.
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-4 py-4">
					<div className="space-y-2">
						<Label className="text-xs text-muted-foreground">Position</Label>
						<p className="text-sm font-medium">
							{tokenSymbol || formatAddress(positionId)}
						</p>
						<p className="text-xs text-muted-foreground">
							ID: {formatAddress(positionId)}
						</p>
					</div>

					<div className="space-y-2">
						<Label htmlFor="recipient">Recipient Address</Label>
						<Input
							id="recipient"
							placeholder="0x..."
							value={recipientAddress}
							onChange={(e) => {
								setRecipientAddress(e.target.value)
								setError("")
							}}
							disabled={isTransferring}
							className="font-mono"
						/>
						{error && (
							<div className="flex items-center gap-2 text-sm text-destructive">
								<AlertCircle className="h-4 w-4" />
								{error}
							</div>
						)}
					</div>

					<div className="rounded-lg bg-amber-500/10 p-3">
						<p className="text-xs text-amber-600 dark:text-amber-400">
							⚠️ Warning: This action is irreversible. Make sure you trust the recipient address.
						</p>
					</div>
				</div>

				<DialogFooter>
					<Button
						variant="outline"
						onClick={handleClose}
						disabled={isTransferring}
					>
						Cancel
					</Button>
					<Button
						onClick={handleTransfer}
						disabled={isTransferring || !recipientAddress.trim()}
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