import { LucideIcon } from "lucide-react"
import { Compass, Gift, Rocket } from "lucide-react"

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
		label: "REWARDS",
		href: "/rewards",
		icon: Gift,
	},
]
