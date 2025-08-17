import { env } from "@/env"

interface TwitterUser {
	id: string
	username: string
	name: string
	profile_image_url: string | null
}

export async function getFxtwitterProfileImage(username: string): Promise<string | null> {
	try {
		const response = await fetch(`https://api.fxtwitter.com/${username}`, {
			cache: 'no-store'
		})
		if (!response.ok) {
			console.warn(`fxtwitter API returned ${response.status} for username: ${username}`)
			return null
		}
		const data = await response.json()
		if (data?.user?.avatar_url) {
			const fullResUrl = data.user.avatar_url.replace('_normal', '')
			return fullResUrl
		}
		return null
	} catch (error) {
		console.error('Failed to fetch profile image from fxtwitter:', error)
		return null
	}
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
