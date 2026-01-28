"use client"

import { FC, useEffect, useState } from "react";

import { cn } from "@/utils"
import { getFxtwitterProfileImage } from "@/lib/twitter"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

import { UserAvatarProps } from "./user-avatar.types"

const TwitterUserAvatar:FC<UserAvatarProps> = ({ user, className }) => {
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
	);
}

export default TwitterUserAvatar;
