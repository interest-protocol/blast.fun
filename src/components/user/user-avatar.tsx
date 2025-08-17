"use client"

import { TwitterUser } from "@/context/twitter.context"
import { cn } from "@/utils"
import Image from "next/image"
import { useState, useEffect } from "react"
import { User } from "lucide-react"
import { getHighQualityTwitterAvatar } from "@/lib/twitter-image"
import { avatarCache } from "@/lib/twitter-avatar-cache"

interface UserAvatarProps {
	user: TwitterUser
	className?: string
}

export function TwitterUserAvatar({ user, className }: UserAvatarProps) {
	const [imageUrl, setImageUrl] = useState<string | null>(() => {
		// Check cache first
		if (user.username) {
			const cached = avatarCache.get(user.username)
			if (cached) return cached
		}
		// Otherwise use enhanced original URL
		return getHighQualityTwitterAvatar(user.profile_image_url)
	})
	const [imageError, setImageError] = useState(false)
	const [isLoading, setIsLoading] = useState(false)

	useEffect(() => {
		// Reset error state when user changes
		setImageError(false)

		// Skip if we already have a cached URL for this user
		if (user.username && avatarCache.get(user.username)) {
			return
		}

		// Fetch fresh avatar from fxtwitter API if we have a username
		if (user.username && !isLoading) {
			setIsLoading(true)
			
			fetch(`/api/twitter/avatar/${user.username}`)
				.then(res => res.json())
				.then(data => {
					if (data.avatar_url) {
						// Cache the URL
						avatarCache.set(user.username, data.avatar_url)
						setImageUrl(data.avatar_url)
					}
				})
				.catch(err => {
					console.error("Error fetching avatar from fxtwitter:", err)
					// Use enhanced original URL as fallback
					const enhanced = getHighQualityTwitterAvatar(user.profile_image_url)
					if (enhanced) {
						setImageUrl(enhanced)
					}
				})
				.finally(() => {
					setIsLoading(false)
				})
		}
	}, [user.username, user.profile_image_url, isLoading])

	// Show placeholder while loading or on error
	if (!imageUrl || imageError) {
		return (
			<div className={cn("flex items-center justify-center bg-muted rounded-md", className)}>
				<User className="w-1/2 h-1/2 text-muted-foreground" />
			</div>
		)
	}

	return (
		<div className={cn("relative overflow-hidden bg-muted rounded-md", className)}>
			<Image
				key={imageUrl} // Force new instance when URL changes
				src={imageUrl}
				alt={`@${user.username}'s avatar`}
				fill
				sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
				className="object-cover"
				onError={() => {
					setImageError(true)
					// Try to use original URL as last resort
					const enhanced = getHighQualityTwitterAvatar(user.profile_image_url)
					if (enhanced && enhanced !== imageUrl) {
						setImageError(false)
						setImageUrl(enhanced)
					}
				}}
				priority={true} // Load avatars with priority
				quality={90}
				placeholder="empty"
				unoptimized // Avoid CORS issues with external images
			/>
		</div>
	)
}
