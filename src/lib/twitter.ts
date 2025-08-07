import { env } from "@/env"

interface TwitterUser {
	id: string
	username: string
	name: string
	profile_image_url: string | null
}

export class TwitterAPI {
	async getUserInfoByUsername(username: string): Promise<TwitterUser> {
		const response = await fetch(`https://api.twitterapi.io/user/username/${username}`, {
			headers: {
				"X-API-Key": env.TWITTER_API_IO_KEY,
			},
		})

		if (!response.ok) {
			throw new Error("Failed to fetch user info from twitterapi.io")
		}

		const data = await response.json()
		return {
			id: data.data.id,
			username: data.data.username,
			name: data.data.name,
			profile_image_url: data.data.profile_image_url,
		}
	}
}
