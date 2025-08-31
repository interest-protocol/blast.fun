"use client"

import { useState, useEffect } from "react"
import { useLocalParticipant, useRoomContext } from "@livekit/components-react"
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Mic, Video } from "lucide-react"
import { useAuthToken } from "./token-context"

export function StageInvitationDialog() {
	const [open, setOpen] = useState(false)
	const [isAccepting, setIsAccepting] = useState(false)
	const { localParticipant } = useLocalParticipant()
	const { name: roomName } = useRoomContext()
	const authToken = useAuthToken()
	
	// @dev: Parse metadata and check for invitation
	useEffect(() => {
		try {
			console.log("StageInvitationDialog - raw metadata:", localParticipant.metadata)
			
			const metadata = localParticipant.metadata ? JSON.parse(localParticipant.metadata) : {}
			const hasInvitation = metadata?.invited_to_stage === true && metadata?.accepted_invite !== true
			
			console.log("StageInvitationDialog - checking invitation:", {
				identity: localParticipant.identity,
				metadata,
				hasInvitation,
				invited: metadata?.invited_to_stage,
				accepted: metadata?.accepted_invite,
				currentOpenState: open
			})
			
			// @dev: Always sync open state with invitation status
			if (hasInvitation && !open) {
				console.log("Opening stage invitation dialog automatically for:", localParticipant.identity)
				setOpen(true)
			} else if (!hasInvitation && open) {
				console.log("Closing stage invitation dialog - no longer invited")
				setOpen(false)
			}
		} catch (error) {
			console.error("Error parsing metadata in StageInvitationDialog:", error)
		}
	}, [localParticipant.metadata, open]) // Watch metadata changes and current open state
	
	// @dev: Listen for manual trigger event and add polling as backup
	useEffect(() => {
		const handleShowInvitation = () => {
			const metadata = localParticipant.metadata ? JSON.parse(localParticipant.metadata) : {}
			if (metadata?.invited_to_stage && !metadata?.accepted_invite) {
				console.log("Manual trigger: Opening invitation dialog")
				setOpen(true)
			}
		}
		
		// @dev: Backup polling to check for invitations every second
		const checkInterval = setInterval(() => {
			if (localParticipant.metadata) {
				try {
					const metadata = JSON.parse(localParticipant.metadata)
					if (metadata?.invited_to_stage === true && metadata?.accepted_invite !== true && !open) {
						console.log("Polling detected invitation - opening dialog")
						setOpen(true)
					}
				} catch (e) {
					// Ignore parse errors
				}
			}
		}, 1000)
		
		window.addEventListener('show-stage-invitation', handleShowInvitation)
		return () => {
			window.removeEventListener('show-stage-invitation', handleShowInvitation)
			clearInterval(checkInterval)
		}
	}, [localParticipant.metadata, open])
	
	const handleAccept = async () => {
		setIsAccepting(true)
		// @dev: Update metadata to mark invitation as accepted
		const response = await fetch("/api/stream/accept-invitation", {
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
		
		if (response.ok) {
			// @dev: Close dialog and let the video player handle permissions
			setOpen(false)
		}
		setIsAccepting(false)
	}
	
	const handleDecline = async () => {
		setIsAccepting(true)
		// @dev: Clear the invitation
		const response = await fetch("/api/stream/decline-invitation", {
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
		
		if (response.ok) {
			console.log("Invitation declined successfully")
			setOpen(false)
		} else {
			console.error("Failed to decline invitation")
		}
		setIsAccepting(false)
	}
	
	// @dev: Force render a debug message if invitation is pending
	if (localParticipant.metadata) {
		try {
			const metadata = JSON.parse(localParticipant.metadata)
			if (metadata?.invited_to_stage && !metadata?.accepted_invite) {
				console.log("Stage invitation detected - should show dialog:", { open, metadata })
			}
		} catch (e) {
			// Ignore
		}
	}
	
	return (
		<Dialog open={open} onOpenChange={(newOpen) => {
			// @dev: Don't allow closing while accepting
			if (!isAccepting && !newOpen) {
				// @dev: User is trying to close - treat as decline
				handleDecline()
			}
		}}>
			<DialogContent onPointerDownOutside={(e) => {
				// @dev: Prevent closing on outside click while processing
				if (isAccepting) {
					e.preventDefault()
				}
			}}>
				<DialogHeader>
					<DialogTitle>You&apos;ve been invited to join the stage!</DialogTitle>
					<DialogDescription>
						The host has invited you to share your camera and microphone with the audience.
					</DialogDescription>
				</DialogHeader>
				
				<div className="flex flex-col gap-4 py-4">
					<div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
						<Video className="h-5 w-5 text-muted-foreground" />
						<div className="flex-1">
							<p className="text-sm font-medium">Camera</p>
							<p className="text-xs text-muted-foreground">Your camera will be shared</p>
						</div>
					</div>
					
					<div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
						<Mic className="h-5 w-5 text-muted-foreground" />
						<div className="flex-1">
							<p className="text-sm font-medium">Microphone</p>
							<p className="text-xs text-muted-foreground">Your microphone will be enabled</p>
						</div>
					</div>
				</div>
				
				<DialogFooter>
					<Button 
						variant="outline" 
						onClick={handleDecline}
						disabled={isAccepting}
					>
						Decline
					</Button>
					<Button 
						onClick={handleAccept}
						disabled={isAccepting}
					>
						{isAccepting ? "Joining..." : "Join Stage"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	)
}