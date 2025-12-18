import { LogEntry } from "../../_hooks/use-launch-coin"

export interface TerminalDialogProps {
	open: boolean
	onOpenChange: (open: boolean) => void
	logs: LogEntry[]
	isLaunching: boolean
	result: {
		poolObjectId: string
		poolTxDigest: string
	} | null
	pendingToken: {
		treasuryCapObjectId: string
		txDigest: string
	} | null
	onResume?: () => void
}
