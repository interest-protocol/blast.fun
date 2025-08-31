"use client"

import { StreamVideoPlayer } from "./stream-video-player"
import { StreamChat } from "./stream-chat"
import { ReactionBar } from "./reaction-bar"
import { useBreakpoint } from "@/hooks/use-breakpoint"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { MessageSquare, X } from "lucide-react"

interface StreamViewProps {
	roomName: string
	session: any
}

export function StreamView({ roomName, session }: StreamViewProps) {
	const { isMobile } = useBreakpoint()
	const [showMobileChat, setShowMobileChat] = useState(false)

	// @dev: Mobile layout - fullscreen video with floating chat
	if (isMobile) {
		return (
			<div className="relative w-full h-[calc(100vh-64px-64px)]">
				<div className="flex flex-col h-full">
					<div className="flex-1 bg-black">
						<StreamVideoPlayer session={session} />
					</div>
					<ReactionBar />
				</div>
				
				{/* @dev: Mobile chat overlay */}
				{showMobileChat && (
					<div className="absolute inset-0 bg-background z-50 flex flex-col">
						<div className="flex items-center justify-between p-3 border-b">
							<span className="text-sm font-mono font-medium">Live Chat</span>
							<Button
								size="sm"
								variant="ghost"
								onClick={() => setShowMobileChat(false)}
							>
								<X className="h-4 w-4" />
							</Button>
						</div>
						<div className="flex-1 overflow-hidden">
							<StreamChat session={session} />
						</div>
					</div>
				)}
				
				{/* @dev: Floating chat button above mobile nav */}
				<Button
					size="icon"
					className="absolute bottom-20 right-4 rounded-full shadow-lg z-40"
					onClick={() => setShowMobileChat(true)}
				>
					<MessageSquare className="h-5 w-5" />
				</Button>
			</div>
		)
	}

	// @dev: Desktop layout - side by side
	return (
		<div className="w-full h-[calc(100vh-64px)] flex">
			<div className="flex-1 flex flex-col min-w-0">
				<div className="flex-1 bg-black relative">
					<StreamVideoPlayer session={session} />
				</div>
				<ReactionBar />
			</div>
			<div className="w-[280px] border-l flex-shrink-0">
				<StreamChat session={session} />
			</div>
		</div>
	)
}