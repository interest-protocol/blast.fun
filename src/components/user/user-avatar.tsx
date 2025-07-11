"use client";

import { cn } from "@/utils";
import { TwitterUser } from "@/types/twitter";

interface UserAvatarProps {
    user: TwitterUser,
    className?: string;
}

export function TwitterUserAvatar({ user, className }: UserAvatarProps) {
    return (
        <img src={user.profile_image_url} className={cn('rounded-md', className)} />
    );
}