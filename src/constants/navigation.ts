import { Compass, Gift, LucideIcon, Rocket, Radio } from "lucide-react"

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
	{
		label: "STREAM",
		href: "/stream",
		icon: Radio,
	},
]
