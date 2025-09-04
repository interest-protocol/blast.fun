import { Compass, Trophy, LucideIcon, Rocket } from "lucide-react"

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
		label: "LEADERBOARD",
		href: "/leaderboard",
		icon: Trophy,
	},
]
