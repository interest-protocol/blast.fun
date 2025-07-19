"use client"

import { Gift, Target, Trophy, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function RewardsPage() {
	return (
		<div className="space-y-6">
			<div className="text-center border-b pb-6">
				<h1 className="text-4xl font-bold font-mono uppercase tracking-wider text-foreground/80 mb-2">
					REWARDS::PROGRAM
				</h1>
				<p className="font-mono text-sm uppercase text-muted-foreground">EARN_REWARDS_FOR_PARTICIPATION</p>
			</div>

			{/* Stats Overview */}
			<div className="grid gap-4 md:grid-cols-4">
				<Card className="border-2 bg-background/50 backdrop-blur-sm">
					<CardContent className="p-6">
						<div className="flex items-center justify-between">
							<div>
								<p className="font-mono text-xs uppercase text-muted-foreground mb-1">TOTAL::EARNED</p>
								<p className="font-mono text-2xl font-bold uppercase">[0]</p>
							</div>
							<Trophy className="h-8 w-8 text-primary/60" />
						</div>
					</CardContent>
				</Card>

				<Card className="border-2 bg-background/50 backdrop-blur-sm">
					<CardContent className="p-6">
						<div className="flex items-center justify-between">
							<div>
								<p className="font-mono text-xs uppercase text-muted-foreground mb-1">CURRENT::STREAK</p>
								<p className="font-mono text-2xl font-bold uppercase">[0]</p>
							</div>
							<Zap className="h-8 w-8 text-primary/60" />
						</div>
					</CardContent>
				</Card>

				<Card className="border-2 bg-background/50 backdrop-blur-sm">
					<CardContent className="p-6">
						<div className="flex items-center justify-between">
							<div>
								<p className="font-mono text-xs uppercase text-muted-foreground mb-1">RANK::POSITION</p>
								<p className="font-mono text-2xl font-bold uppercase">[???]</p>
							</div>
							<Target className="h-8 w-8 text-primary/60" />
						</div>
					</CardContent>
				</Card>

				<Card className="border-2 bg-background/50 backdrop-blur-sm">
					<CardContent className="p-6">
						<div className="flex items-center justify-between">
							<div>
								<p className="font-mono text-xs uppercase text-muted-foreground mb-1">MULTIPLIER::ACTIVE</p>
								<p className="font-mono text-2xl font-bold uppercase">1.0X</p>
							</div>
							<Gift className="h-8 w-8 text-primary/60" />
						</div>
					</CardContent>
				</Card>
			</div>

			{/* Reward Tasks */}
			<Card className="border-2 bg-background/50 backdrop-blur-sm shadow-2xl">
				<CardHeader className="pb-4 border-b">
					<CardTitle className="text-lg font-mono uppercase tracking-wider">AVAILABLE::TASKS</CardTitle>
				</CardHeader>
				<CardContent className="pt-6">
					<div className="space-y-4">
						<div className="flex items-center justify-between p-4 border border-dashed rounded-lg">
							<div>
								<p className="font-mono text-sm uppercase">DAILY::LOGIN</p>
								<p className="font-mono text-xs text-muted-foreground mt-1">
									LOGIN_CONSECUTIVELY_FOR_REWARDS
								</p>
							</div>
							<div className="text-right">
								<p className="font-mono text-sm font-bold uppercase text-primary">+100</p>
								<Button size="sm" variant="outline" className="mt-2 font-mono text-xs uppercase" disabled>
									[LOCKED]
								</Button>
							</div>
						</div>

						<div className="flex items-center justify-between p-4 border border-dashed rounded-lg">
							<div>
								<p className="font-mono text-sm uppercase">CREATE::TOKEN</p>
								<p className="font-mono text-xs text-muted-foreground mt-1">LAUNCH_YOUR_FIRST_TOKEN</p>
							</div>
							<div className="text-right">
								<p className="font-mono text-sm font-bold uppercase text-primary">+500</p>
								<Button size="sm" variant="outline" className="mt-2 font-mono text-xs uppercase" disabled>
									[LOCKED]
								</Button>
							</div>
						</div>

						<div className="flex items-center justify-between p-4 border border-dashed rounded-lg">
							<div>
								<p className="font-mono text-sm uppercase">TRADE::VOLUME</p>
								<p className="font-mono text-xs text-muted-foreground mt-1">REACH_100_SUI_TRADING_VOLUME</p>
							</div>
							<div className="text-right">
								<p className="font-mono text-sm font-bold uppercase text-primary">+250</p>
								<Button size="sm" variant="outline" className="mt-2 font-mono text-xs uppercase" disabled>
									[LOCKED]
								</Button>
							</div>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Leaderboard Preview */}
			<Card className="border-2 bg-background/50 backdrop-blur-sm shadow-2xl">
				<CardHeader className="pb-4 border-b">
					<CardTitle className="text-lg font-mono uppercase tracking-wider">LEADERBOARD::TOP</CardTitle>
				</CardHeader>
				<CardContent className="pt-6">
					<div className="font-mono text-sm uppercase text-muted-foreground text-center py-8">
						LEADERBOARD_DATA_UNAVAILABLE
					</div>
				</CardContent>
			</Card>
		</div>
	)
}
