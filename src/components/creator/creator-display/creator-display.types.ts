export type DisplayType = 'twitter' | 'domain' | 'wallet'

export interface DisplayData {
	display: string
	href: string | null
	type: DisplayType
}

export interface CreatorDisplayProps extends React.HTMLAttributes<HTMLElement> {
    twitterHandle?: string
    twitterId?: string
    walletAddress?: string
    className?: string
    onClick?: (e: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>) => void
    asLink?: boolean
}