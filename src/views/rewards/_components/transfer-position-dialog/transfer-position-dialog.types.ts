export interface TransferPositionDialogProps {
	open: boolean
	tokenSymbol?: string
	onOpenChange: (open: boolean) => void
	onConfirm: (address: string) => Promise<boolean>
}