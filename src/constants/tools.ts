import { Send, Clock, TrendingUp, Lock, LucideIcon } from "lucide-react"

export interface ToolItem {
	title: string
	description: string
	icon: LucideIcon
	href: string
	comingSoon?: boolean
}

export const toolItems: ToolItem[] = [
	{
		title: "Airdrop",
		description: "Distribute tokens to multiple recipients efficiently. Supports SuiNS names and CSV imports.",
		icon: Send,
		href: "/tools/airdrop",
		comingSoon: false,
	},
	{
		title: "Vesting",
		description: "Create token vesting schedules with customizable unlock periods and conditions.",
		icon: Clock,
		href: "/tools/vesting",
		comingSoon: false,
	},
	{
		title: "DCA",
		description: "Dollar-cost average into tokens automatically over time with customizable intervals.",
		icon: TrendingUp,
		href: "/tools/dca",
		comingSoon: true,
	},
]
