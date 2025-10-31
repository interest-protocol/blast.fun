import { Compass, LucideIcon, Rocket, Gift, Wrench, Coins, HandCoins } from "lucide-react"

export interface NavItem {
	label: string
	href: string
	icon: LucideIcon
}

export const navigationItems: NavItem[] = [
	{
		label: "Discover",
		href: "/",
		icon: Compass,
	},
	{
		label: "Launch",
		href: "/launch",
		icon: Rocket,
	},
	{
		label: "Farms",
		href: "/farms",
		icon: HandCoins,
	},
	{
		label: "Portfolio",
		href: "/portfolio",
		icon: Coins,
	},
	{
		label: "Rewards",
		href: "/rewards",
		icon: Gift,
	},
	{
		label: "Tools",
		href: "/tools",
		icon: Wrench,
	},
]
