"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Loader2 } from "lucide-react"

interface CreateRoomDialogProps {
	children: React.ReactNode
	onRoomCreated?: () => void
}

export function CreateRoomDialog({ children, onRoomCreated }: CreateRoomDialogProps) {
	const router = useRouter()
	const [open, setOpen] = useState(false)
	const [loading, setLoading] = useState(false)
	const [roomName, setRoomName] = useState("")
	const [enableChat, setEnableChat] = useState(true)
	const [allowParticipation, setAllowParticipation] = useState(true)
	const [streamType, setStreamType] = useState<"browser" | "obs">("browser")

	const handleCreateRoom = async () => {
		if (!roomName.trim()) return

		setLoading(true)
		try {
			const endpoint = streamType === "obs" ? "/api/stream/create-ingress" : "/api/stream/create"
			const response = await fetch(endpoint, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					room_name: roomName,
					metadata: {
						creator_identity: "user", // @dev: This should come from auth context
						enable_chat: enableChat,
						allow_participation: allowParticipation,
					},
					ingress_type: streamType === "obs" ? "RTMP_INPUT" : undefined,
				}),
			})

			if (response.ok) {
				const data = await response.json()
				
				// @dev: Store connection details for the stream
				if (typeof window !== "undefined") {
					sessionStorage.setItem("stream_token", data.auth_token)
					sessionStorage.setItem("stream_connection", JSON.stringify(data.connection_details))
				}

				setOpen(false)
				onRoomCreated?.()
				
				if (streamType === "browser") {
					router.push(`/stream/host?room=${roomName}`)
				} else {
					// @dev: Show ingress details for OBS streaming
					router.push(`/stream/ingress?room=${roomName}`)
				}
			} else {
				console.error("Failed to create room")
			}
		} catch (error) {
			console.error("Error creating room:", error)
		} finally {
			setLoading(false)
		}
	}

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>{children}</DialogTrigger>
			<DialogContent className="sm:max-w-[425px]">
				<DialogHeader>
					<DialogTitle>Create New Stream</DialogTitle>
					<DialogDescription>
						Set up your livestream settings and start broadcasting
					</DialogDescription>
				</DialogHeader>
				<div className="grid gap-4 py-4">
					<div className="grid gap-2">
						<Label htmlFor="room-name">Room Name</Label>
						<Input
							id="room-name"
							placeholder="my-awesome-stream"
							value={roomName}
							onChange={(e) => setRoomName(e.target.value)}
							disabled={loading}
						/>
					</div>

					<div className="grid gap-2">
						<Label>Stream Type</Label>
						<RadioGroup value={streamType} onValueChange={(v) => setStreamType(v as "browser" | "obs")}>
							<div className="flex items-center space-x-2">
								<RadioGroupItem value="browser" id="browser" />
								<Label htmlFor="browser" className="font-normal">
									Stream from browser
								</Label>
							</div>
							<div className="flex items-center space-x-2">
								<RadioGroupItem value="obs" id="obs" />
								<Label htmlFor="obs" className="font-normal">
									Stream from OBS/External software
								</Label>
							</div>
						</RadioGroup>
					</div>

					<div className="flex items-center justify-between">
						<Label htmlFor="enable-chat" className="flex-1">
							Enable Chat
						</Label>
						<Switch
							id="enable-chat"
							checked={enableChat}
							onCheckedChange={setEnableChat}
							disabled={loading}
						/>
					</div>

					<div className="flex items-center justify-between">
						<Label htmlFor="allow-participation" className="flex-1">
							Allow Viewer Participation
						</Label>
						<Switch
							id="allow-participation"
							checked={allowParticipation}
							onCheckedChange={setAllowParticipation}
							disabled={loading}
						/>
					</div>
				</div>
				<DialogFooter>
					<Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>
						Cancel
					</Button>
					<Button onClick={handleCreateRoom} disabled={loading || !roomName.trim()}>
						{loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
						{loading ? "Creating..." : "Create Stream"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	)
}