"use client"

import { useEffect, useState, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Copy, Check, ArrowLeft } from "lucide-react"
import toast from "react-hot-toast"

function IngressContent() {
	const searchParams = useSearchParams()
	const router = useRouter()
	const roomName = searchParams.get("room")
	const [ingressDetails, setIngressDetails] = useState<any>(null)
	const [copiedUrl, setCopiedUrl] = useState(false)
	const [copiedKey, setCopiedKey] = useState(false)

	useEffect(() => {
		if (!roomName) {
			router.push("/stream")
			return
		}

		// @dev: Get ingress details from session storage
		const storedConnection = sessionStorage.getItem("stream_connection")
		
		if (storedConnection) {
			const connection = JSON.parse(storedConnection)
			// @dev: In a real implementation, the ingress details would be included
			// For now, we'll show placeholder values
			setIngressDetails({
				url: `rtmp://ingest.livekit.cloud/live`,
				streamKey: roomName,
			})
		} else {
			router.push("/stream")
		}
	}, [roomName, router])

	const copyToClipboard = (text: string, type: "url" | "key") => {
		navigator.clipboard.writeText(text)
		if (type === "url") {
			setCopiedUrl(true)
			toast.success("Server URL copied!")
			setTimeout(() => setCopiedUrl(false), 2000)
		} else {
			setCopiedKey(true)
			toast.success("Stream key copied!")
			setTimeout(() => setCopiedKey(false), 2000)
		}
	}

	const handleBackToStreams = () => {
		sessionStorage.removeItem("stream_token")
		sessionStorage.removeItem("stream_connection")
		router.push("/stream")
	}

	if (!ingressDetails) {
		return (
			<div className="flex items-center justify-center min-h-screen">
				<p className="text-muted-foreground">Loading ingress details...</p>
			</div>
		)
	}

	return (
		<div className="container mx-auto py-8 max-w-4xl">
			<Button
				variant="ghost"
				onClick={handleBackToStreams}
				className="mb-4"
			>
				<ArrowLeft className="w-4 h-4 mr-2" />
				Back to Streams
			</Button>

			<Card>
				<CardHeader>
					<CardTitle>OBS/External Streaming Setup</CardTitle>
					<CardDescription>
						Use these settings in your streaming software to broadcast to your room
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-6">
					<div>
						<h3 className="text-sm font-semibold mb-2">Room Name</h3>
						<p className="font-mono text-sm bg-muted p-2 rounded">{roomName}</p>
					</div>

					<div>
						<h3 className="text-sm font-semibold mb-2">Server URL</h3>
						<div className="flex items-center gap-2">
							<input
								type="text"
								value={ingressDetails.url}
								readOnly
								className="flex-1 font-mono text-sm bg-muted p-2 rounded border-0"
							/>
							<Button
								size="sm"
								variant="outline"
								onClick={() => copyToClipboard(ingressDetails.url, "url")}
							>
								{copiedUrl ? (
									<Check className="w-4 h-4" />
								) : (
									<Copy className="w-4 h-4" />
								)}
							</Button>
						</div>
					</div>

					<div>
						<h3 className="text-sm font-semibold mb-2">Stream Key</h3>
						<div className="flex items-center gap-2">
							<input
								type="text"
								value={ingressDetails.streamKey}
								readOnly
								className="flex-1 font-mono text-sm bg-muted p-2 rounded border-0"
							/>
							<Button
								size="sm"
								variant="outline"
								onClick={() => copyToClipboard(ingressDetails.streamKey, "key")}
							>
								{copiedKey ? (
									<Check className="w-4 h-4" />
								) : (
									<Copy className="w-4 h-4" />
								)}
							</Button>
						</div>
					</div>

					<div className="border-t pt-6">
						<h3 className="text-sm font-semibold mb-2">OBS Configuration Steps:</h3>
						<ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
							<li>Open OBS Studio</li>
							<li>Go to Settings → Stream</li>
							<li>Set Service to &quot;Custom&quot;</li>
							<li>Enter the Server URL above</li>
							<li>Enter the Stream Key above</li>
							<li>Click OK and start streaming</li>
						</ol>
					</div>

					<div className="border-t pt-6">
						<p className="text-sm text-muted-foreground mb-4">
							Once you start streaming from OBS, viewers can join your stream at:
						</p>
						<div className="font-mono text-sm bg-muted p-2 rounded">
							{window.location.origin}/stream/room/{roomName}
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	)
}

export default function IngressPage() {
	return (
		<Suspense fallback={
			<div className="flex items-center justify-center min-h-screen">
				<p className="text-muted-foreground">Loading...</p>
			</div>
		}>
			<IngressContent />
		</Suspense>
	)
}