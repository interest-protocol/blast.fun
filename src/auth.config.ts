import { type NextAuthConfig } from "next-auth"
import Twitter from "next-auth/providers/twitter"
import { env } from "@/env"

export default {
	secret: env.AUTH_SECRET,
	providers: [
		Twitter({
			clientId: env.TWITTER_CLIENT_ID,
			clientSecret: env.TWITTER_CLIENT_SECRET,
			profile(profile) {
				return {
					twitterId: profile.data.id,
					id: profile.data.id,
					name: profile.data.name,
					email: `${profile.data.username}@twitter.local`,
					image: profile.data.profile_image_url,
					username: profile.data.username,
				}
			},
		}),
	],
} satisfies NextAuthConfig