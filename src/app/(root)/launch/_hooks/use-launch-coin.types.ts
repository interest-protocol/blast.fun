import { TokenFormValues } from "../_components/create-token-form"

export interface LaunchResultProps {
	treasuryCapObjectId: string
	tokenTxDigest: string
	poolObjectId: string
	poolTxDigest: string
}

export interface LogEntryProps {
	timestamp: string
	message: string
	type: "info" | "success" | "error" | "warning"
}

export interface PendingTokenProps {
	treasuryCapObjectId: string
	txDigest: string
	formValues: TokenFormValues
}

export interface LaunchDataProps {
	poolObjectId: string
	tokenTxHash: string
	poolTxHash: string
	hideIdentity: boolean
	protectionSettings?: {
		requireTwitter: boolean
		revealTraderIdentity: boolean
		minFollowerCount?: string
		maxHoldingPercent?: string
	}
}