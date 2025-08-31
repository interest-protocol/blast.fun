"use client"

import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Hand, UserPlus, UserMinus } from "lucide-react"
import { useLocalParticipant, useParticipants, useRoomContext } from "@livekit/components-react"
import { useState } from "react"
import { useAuthToken } from "./token-context"

interface PresenceDialogProps {
	children: React.ReactNode
	isHost?: boolean
}

export function PresenceDialog({ children, isHost = false }: PresenceDialogProps) {
	const [open, setOpen] = useState(false)
	const { localParticipant } = useLocalParticipant()
	const participants = useParticipants()
	const { metadata, name: roomName } = useRoomContext()
	const roomMetadata = metadata ? JSON.parse(metadata) : {}
	const authToken = useAuthToken()
	
	const localMetadata = localParticipant.metadata ? JSON.parse(localParticipant.metadata) : {}
	const canRaiseHand = !isHost && !localMetadata?.invited_to_stage

	const handleRaiseHand = async () => {
		await fetch("/api/stream/raise-hand", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${authToken}`,
			},
			body: JSON.stringify({
				identity: localParticipant.identity,
				roomName: roomName,
			}),
		})
	}

	const handleInviteToStage = async (identity: string) => {
		await fetch("/api/stream/invite-to-stage", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${authToken}`,
			},
			body: JSON.stringify({
				identity,
				roomName: roomName,
			}),
		})
	}

	const handleRemoveFromStage = async (identity: string) => {
		await fetch("/api/stream/remove-from-stage", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${authToken}`,
			},
			body: JSON.stringify({
				identity,
				roomName: roomName,
			}),
		})
	}

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>{children}</DialogTrigger>
			<DialogContent className="max-w-md">
				<DialogHeader>
					<DialogTitle>Who&apos;s here</DialogTitle>
				</DialogHeader>
				
				{isHost && (
					<div className="mb-2">
						<span className="text-xs text-muted-foreground uppercase font-medium">HOST</span>
					</div>
				)}
				
				<ScrollArea className="h-[400px] pr-4">
					<div className="space-y-2">
						{participants.map((participant) => {
							const metadata = participant.metadata ? JSON.parse(participant.metadata) : {}
							const isCreator = roomMetadata?.creator_identity === participant.identity
							const isOnStage = metadata?.invited_to_stage && metadata?.accepted_invite
							const hasRaisedHand = metadata?.hand_raised && !metadata?.invited_to_stage
							const hasPendingInvite = metadata?.invited_to_stage && !metadata?.accepted_invite
							const isLocal = participant.identity === localParticipant.identity
							
							return (
								<div
									key={participant.identity}
									className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50"
								>
									<div className="flex items-center gap-2">
										<Avatar className="h-8 w-8">
											{metadata?.image && (
												<AvatarImage src={metadata.image} />
											)}
											<AvatarFallback className="text-xs">
												{participant.identity[0] ?? "?"}
											</AvatarFallback>
										</Avatar>
										
										<div className="flex items-center gap-2">
											<span className="text-sm font-medium">
												{participant.identity}
											</span>
											{isLocal && (
												<span className="text-xs text-muted-foreground">(you)</span>
											)}
											{isCreator && (
												<Badge variant="default" className="text-[10px] px-1">
													Host
												</Badge>
											)}
											{hasRaisedHand && (
												<Hand className="h-3 w-3 text-orange-500 animate-pulse" />
											)}
											{hasPendingInvite && (
												<Badge variant="outline" className="text-[10px] px-1 animate-pulse">
													Invited
												</Badge>
											)}
										</div>
									</div>
									
									<div className="flex items-center gap-1">
										{isHost && !isCreator && (
											<>
												{hasRaisedHand && (
													<Button
														size="sm"
														variant="ghost"
														onClick={() => handleInviteToStage(participant.identity)}
														className="h-7 px-2"
													>
														<UserPlus className="h-3 w-3" />
													</Button>
												)}
												{isOnStage && (
													<Button
														size="sm"
														variant="ghost"
														onClick={() => handleRemoveFromStage(participant.identity)}
														className="h-7 px-2"
													>
														<UserMinus className="h-3 w-3" />
													</Button>
												)}
											</>
										)}
										
										{isLocal && canRaiseHand && !isOnStage && !hasPendingInvite && (
											<Button
												size="sm"
												variant={localMetadata?.hand_raised ? "default" : "outline"}
												onClick={handleRaiseHand}
												className="h-7 px-2"
											>
												<Hand className="h-3 w-3 mr-1" />
												{localMetadata?.hand_raised ? "Lower" : "Raise"}
											</Button>
										)}
										
										{isLocal && hasPendingInvite && (
											<Badge variant="destructive" className="text-xs animate-pulse">
												Invitation Pending...
											</Badge>
										)}
										
										{isLocal && isOnStage && !isCreator && (
											<Badge variant="default" className="text-xs">
												On Stage
											</Badge>
										)}
									</div>
								</div>
							)
						})}
					</div>
				</ScrollArea>
			</DialogContent>
		</Dialog>
	)
}