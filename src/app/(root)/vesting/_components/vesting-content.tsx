"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CreateVesting } from "./create-vesting"
import { VestingPositions } from "./vesting-positions"

export default function VestingContent() {
	return (
		<div className="flex justify-center py-8">
			<div className="w-full max-w-4xl px-4">
				<div className="mb-8">
					<h1 className="text-3xl font-bold">Token Vesting</h1>
					<p className="text-muted-foreground mt-2">
						Lock your tokens with custom vesting periods
					</p>
				</div>

				<Tabs defaultValue="create" className="w-full">
					<TabsList className="grid w-full grid-cols-2">
						<TabsTrigger value="create">Create Vesting</TabsTrigger>
						<TabsTrigger value="positions">My Positions</TabsTrigger>
					</TabsList>

					<TabsContent value="create" className="mt-6">
						<CreateVesting />
					</TabsContent>

					<TabsContent value="positions" className="mt-6">
						<VestingPositions />
					</TabsContent>
				</Tabs>
			</div>
		</div>
	)
}