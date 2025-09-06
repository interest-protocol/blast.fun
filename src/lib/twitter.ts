interface TwitterUser {
	id: string
	username: string
	name: string
	profile_image_url: string | null
	followers?: number
	following?: number
}

export async function getFxtwitterProfileImage(username: string): Promise<string | null> {
	try {
		const response = await fetch(`https://api.fxtwitter.com/${username}`)
		if (!response.ok) {
			console.warn(`fxtwitter API returned ${response.status} for username: ${username}`)
			return null
		}
		const data = await response.json()
		if (data?.user?.avatar_url) {
			const fullResUrl = data.user.avatar_url.replace("_normal", "")
			return fullResUrl
		}
		return null
	} catch (error) {
		console.error("Failed to fetch profile image from fxtwitter:", error)
		return null
	}
}

export async function getFxtwitterUserInfo(username: string): Promise<TwitterUser | null> {
	try {
		const response = await fetch(`https://api.fxtwitter.com/${username}`)
		if (!response.ok) {
			console.warn(`fxtwitter API returned ${response.status} for username: ${username}`)
			return null
		}
		const data = await response.json()
		if (data?.user) {
			return {
				id: data.user.id || "",
				username: data.user.screen_name || username,
				name: data.user.name || "",
				profile_image_url: data.user.avatar_url ? data.user.avatar_url.replace("_normal", "") : null,
				followers: data.user.followers || 0,
				following: data.user.following || 0,
			}
		}
		return null
	} catch (error) {
		console.error("Failed to fetch user info from fxtwitter:", error)
		return null
	}
}
