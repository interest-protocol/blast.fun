"use client"

import { TwitterUser } from "@/context/twitter.context"
import { getFxtwitterProfileImage } from "@/lib/twitter"
import { cn } from "@/utils"
import { useEffect, useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar"

interface UserAvatarProps {
	user: TwitterUser
	className?: string
}

export function TwitterUserAvatar({ user, className }: UserAvatarProps) {
	const [profileImageUrl, setProfileImageUrl] = useState<string | null>(user.profile_image_url)

	useEffect(() => {
		const fetchUpdatedProfileImage = async () => {
			if (user.username) {
				const updatedImage = await getFxtwitterProfileImage(user.username)
				if (updatedImage) {
					setProfileImageUrl(updatedImage)
				}
			}
		}
		fetchUpdatedProfileImage()
	}, [user.username])

	const fallback = (user.name || user.username || "?")[0]?.toUpperCase() || "?"

	return (
		<Avatar className={cn("rounded-md", className)}>
			<AvatarImage
				src={profileImageUrl || user.profile_image_url || ""}
				alt={user.username || "User"}
			/>

			<AvatarFallback className="rounded-md text-xs">
				{fallback}
			</AvatarFallback>
		</Avatar>
	)
}
