import { Compass, Gift, LucideIcon, Rocket, Wallet } from "lucide-react"

export interface NavItem {
	label: string
	href: string
	icon: LucideIcon
}

export const navigationItems: NavItem[] = [
	{
		label: "DISCOVER",
		href: "/",
		icon: Compass,
	},
	{
		label: "LAUNCH",
		href: "/launch",
		icon: Rocket,
	},
	{
		label: "PORTFOLIO",
		href: "/portfolio",
		icon: Wallet,
	},
	{
		label: "REWARDS",
		href: "/rewards",
		icon: Gift,
	},
]
