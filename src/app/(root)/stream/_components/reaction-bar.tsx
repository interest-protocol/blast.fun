"use client"

import { Button } from "@/components/ui/button"
import { useChat, useDataChannel } from "@livekit/components-react"
import { useState } from "react"

export function ReactionBar() {
	const [encoder] = useState(() => new TextEncoder())
	const { send: sendDataChannel } = useDataChannel("reactions", (msg: any) => {
		// @dev: Handle incoming reactions if needed
	})
	const { send: sendChat } = useChat()

	const onSend = (emoji: string) => {
		// @dev: Send reaction through data channel for confetti
		if (sendDataChannel) {
			sendDataChannel(encoder.encode(emoji), { reliable: false })
		}
		// @dev: Also send to chat
		if (sendChat) {
			sendChat(emoji)
		}
	}

	return (
		<div className="border-t border-border/50 bg-accent/5 h-[100px] flex items-center justify-center">
			<div className="flex gap-3">
				<Button
					size="lg"
					variant="outline"
					onClick={() => onSend("🔥")}
					className="h-16 w-20 text-2xl hover:scale-110 transition-transform border-2"
				>
					🔥
				</Button>
				<Button
					size="lg"
					variant="outline"
					onClick={() => onSend("👏")}
					className="h-16 w-20 text-2xl hover:scale-110 transition-transform border-2"
				>
					👏
				</Button>
				<Button
					size="lg"
					variant="outline"
					onClick={() => onSend("🤣")}
					className="h-16 w-20 text-2xl hover:scale-110 transition-transform border-2"
				>
					🤣
				</Button>
				<Button
					size="lg"
					variant="outline"
					onClick={() => onSend("❤️")}
					className="h-16 w-20 text-2xl hover:scale-110 transition-transform border-2"
				>
					❤️
				</Button>
				<Button
					size="lg"
					variant="outline"
					onClick={() => onSend("🎉")}
					className="h-16 w-20 text-2xl hover:scale-110 transition-transform border-2"
				>
					🎉
				</Button>
			</div>
		</div>
	)
}