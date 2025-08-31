"use client"

import { Play, Users } from "lucide-react"

interface StreamPreviewProps {
	roomName: string
	participantCount: number
}

export function StreamPreview({ roomName, participantCount }: StreamPreviewProps) {
	// @dev: Generate a gradient based on room name for consistent preview
	const getGradientColors = () => {
		const hash = roomName.split('').reduce((acc, char) => char.charCodeAt(0) + acc, 0)
		const colors = [
			['from-purple-600/30', 'to-pink-600/30'],
			['from-blue-600/30', 'to-cyan-600/30'],
			['from-green-600/30', 'to-emerald-600/30'],
			['from-orange-600/30', 'to-red-600/30'],
			['from-indigo-600/30', 'to-purple-600/30']
		]
		return colors[hash % colors.length]
	}
	
	const [fromColor, toColor] = getGradientColors()

	return (
		<div className="relative w-full aspect-video bg-black rounded-t-lg overflow-hidden group">
			<div className={`w-full h-full bg-gradient-to-br ${fromColor} ${toColor}`}>
				<div className="absolute inset-0 bg-black/40" />
				<div className="absolute inset-0 flex items-center justify-center">
					<div className="text-center">
						<div className="text-4xl font-bold text-white/20 uppercase tracking-wider">
							{roomName.charAt(0)}
						</div>
					</div>
				</div>
			</div>
			
			{/* @dev: Overlay with live indicator */}
			<div className="absolute top-2 left-2 flex items-center gap-2">
				<div className="flex items-center gap-1 px-2 py-1 bg-red-500 rounded text-white">
					<div className="w-2 h-2 bg-white rounded-full animate-pulse" />
					<span className="text-xs font-medium uppercase">Live</span>
				</div>
			</div>
			
			{/* @dev: Viewer count */}
			<div className="absolute top-2 right-2">
				<div className="flex items-center gap-1 px-2 py-1 bg-black/60 backdrop-blur-sm rounded">
					<Users className="h-3 w-3 text-white" />
					<span className="text-xs text-white">{participantCount}</span>
				</div>
			</div>
			
			{/* @dev: Play button on hover */}
			<div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
				<div className="bg-white/20 backdrop-blur-sm rounded-full p-4">
					<Play className="h-8 w-8 text-white fill-white" />
				</div>
			</div>
		</div>
	)
}