"use client"

import { Plus, Radio, Users } from "lucide-react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CreateRoomDialog } from "./create-room-dialog"

interface Room {
	name: string
	participantCount: number
	creatorName: string
	isLive: boolean
}

export function RoomList() {
	const router = useRouter()
	const [rooms, setRooms] = useState<Room[]>([])
	const [loading, setLoading] = useState(true)

	useEffect(() => {
		// @dev: Fetch active rooms from the API
		fetchRooms()
	}, [])

	const fetchRooms = async () => {
		try {
			const response = await fetch("/api/stream/rooms")
			if (response.ok) {
				const data = await response.json()
				setRooms(data.rooms || [])
			}
		} catch (error) {
			console.error("Failed to fetch rooms:", error)
		} finally {
			setLoading(false)
		}
	}

	const handleJoinRoom = (roomName: string) => {
		router.push(`/stream/room/${roomName}`)
	}

	return (
		<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
			{/* @dev: Create new room card */}
			<CreateRoomDialog onRoomCreated={fetchRooms}>
				<Card className="cursor-pointer hover:shadow-lg transition-shadow border-dashed">
					<CardHeader className="text-center">
						<div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-2">
							<Plus className="w-6 h-6 text-primary" />
						</div>
						<CardTitle>Create Stream</CardTitle>
						<CardDescription>
							Start your own livestream
						</CardDescription>
					</CardHeader>
				</Card>
			</CreateRoomDialog>

			{/* @dev: Loading state */}
			{loading && (
				<Card className="col-span-full">
					<CardContent className="text-center py-8">
						<p className="text-muted-foreground">Loading streams...</p>
					</CardContent>
				</Card>
			)}

			{/* @dev: Empty state */}
			{!loading && rooms.length === 0 && (
				<Card className="col-span-full">
					<CardContent className="text-center py-8">
						<Radio className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
						<p className="text-muted-foreground">No active streams</p>
						<p className="text-sm text-muted-foreground mt-2">
							Be the first to start streaming!
						</p>
					</CardContent>
				</Card>
			)}

			{/* @dev: Room cards */}
			{rooms.map((room) => (
				<Card 
					key={room.name}
					className="cursor-pointer hover:shadow-lg transition-shadow"
					onClick={() => handleJoinRoom(room.name)}
				>
					<CardHeader>
						<div className="flex items-start justify-between">
							<div className="flex-1">
								<CardTitle className="text-lg">{room.name}</CardTitle>
								<CardDescription className="mt-1">
									Host: {room.creatorName}
								</CardDescription>
							</div>
							{room.isLive && (
								<div className="flex items-center gap-1 text-xs bg-red-500 text-white px-2 py-1 rounded-full">
									<div className="w-2 h-2 bg-white rounded-full animate-pulse" />
									LIVE
								</div>
							)}
						</div>
					</CardHeader>
					<CardContent>
						<div className="flex items-center gap-2 text-sm text-muted-foreground">
							<Users className="w-4 h-4" />
							<span>{room.participantCount} viewers</span>
						</div>
					</CardContent>
				</Card>
			))}
		</div>
	)
}