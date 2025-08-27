"use client"

import { TwitterUser } from "@/context/twitter.context"
import { getFxtwitterProfileImage } from "@/lib/twitter"
import { cn } from "@/utils"
import Image from "next/image"
import { useEffect, useState } from "react"

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

	return <Image unoptimized src={profileImageUrl || user.profile_image_url || ""} alt="user avatar" className={cn("rounded-md", className)} />
}
