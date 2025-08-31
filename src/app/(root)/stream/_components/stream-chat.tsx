"use client"

import { useChat } from "@livekit/components-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Send } from "lucide-react"
import { useState, useEffect, useRef } from "react"

interface StreamChatProps {
	session: any
}

export function StreamChat({ session }: StreamChatProps) {
	const { send, chatMessages } = useChat()
	const [message, setMessage] = useState("")
	const scrollRef = useRef<HTMLDivElement>(null)

	useEffect(() => {
		if (scrollRef.current) {
			scrollRef.current.scrollTop = scrollRef.current.scrollHeight
		}
	}, [chatMessages])

	const handleSend = () => {
		if (message.trim()) {
			send(message)
			setMessage("")
		}
	}

	return (
		<div className="h-full flex flex-col bg-accent/5">
			<div className="text-center py-3 px-4 border-b border-border/50">
				<span className="text-sm font-mono font-semibold text-foreground/80">Live Chat</span>
			</div>
			
			<div 
				ref={scrollRef}
				className="flex-1 overflow-y-auto px-3 py-2 space-y-2"
			>
				{chatMessages.length === 0 && (
					<div className="text-center text-muted-foreground text-xs py-8">
						No messages yet
					</div>
				)}
				
				{chatMessages.map((msg, idx) => {
					// @dev: Check if message is from current user to show avatar
					const isCurrentUser = msg.from?.identity === session?.user?.username
					const userImage = isCurrentUser ? session?.user?.image : null
					
					return (
						<div key={idx} className="flex gap-2 items-start">
							<Avatar className="h-6 w-6 flex-shrink-0">
								{userImage ? (
									<AvatarImage src={userImage} />
								) : null}
								<AvatarFallback className="text-[10px] bg-accent">
									{msg.from?.name?.[0] || msg.from?.identity?.[0] || "?"}
								</AvatarFallback>
							</Avatar>
							<div className="flex-1 min-w-0">
								<div className="text-xs font-bold text-foreground/90">
									{msg.from?.name || msg.from?.identity || "Anonymous"}
								</div>
								<div className="text-xs text-muted-foreground break-words">
									{msg.message}
								</div>
							</div>
						</div>
					)
				})}
			</div>
			
			<div className="p-3 border-t border-border/50">
				<form 
					onSubmit={(e) => {
						e.preventDefault()
						handleSend()
					}}
					className="flex gap-2"
				>
					<Input
						placeholder="Say something..."
						value={message}
						onChange={(e) => setMessage(e.target.value)}
						className="flex-1 text-sm h-10 bg-background"
					/>
					<Button 
						size="icon" 
						type="submit" 
						disabled={!message.trim()} 
						className="h-10 w-10"
					>
						<Send className="h-4 w-4" />
					</Button>
				</form>
			</div>
		</div>
	)
}