import NextAuth from "next-auth"
import Twitter from "next-auth/providers/twitter"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/prisma"
import { env } from "@/env"

export const { handlers, auth, signIn, signOut } = NextAuth({
	adapter: {
		...PrismaAdapter(prisma),
		async createUser(data) {
			const { username, email, emailVerified, image, ...rest } = data as any

			return await prisma.user.create({
				data: {
					id: rest.id,
					name: rest.name,
					username: username || "",
					twitterId: rest.id,
					profileImageUrl: image,
				},
			}) as any // bypass email requirement
		},
		async getUser(id) {
			const user = await prisma.user.findUnique({ where: { id } })
			if (!user) return null

			// return with dummy email to satisfy AdapterUser interface
			return {
				...user,
				email: `${user.username}@twitter.local`,
				emailVerified: null,
				image: user.profileImageUrl,
			}
		},
		async getUserByEmail(email) {
			// Email is currently not supported by Twitter/X OAuth 2.0.
			return null
		},
		async getUserByAccount({ providerAccountId, provider }) {
			const account = await prisma.account.findUnique({
				where: {
					provider_providerAccountId: {
						provider,
						providerAccountId,
					},
				},
				include: { user: true },
			})

			if (!account?.user) return null

			return {
				...account.user,
				email: `${account.user.username}@twitter.local`,
				emailVerified: null,
				image: account.user.profileImageUrl,
			}
		},
		async updateUser(data) {
			const { email, emailVerified, image, ...rest } = data

			const updated = await prisma.user.update({
				where: { id: rest.id },
				data: {
					...rest,
					profileImageUrl: image || undefined,
				},
			})

			return {
				...updated,
				email: `${updated.username}@twitter.local`,
				emailVerified: null,
				image: updated.profileImageUrl,
			}
		},
	},
	providers: [
		Twitter({
			clientId: env.TWITTER_CLIENT_ID,
			clientSecret: env.TWITTER_CLIENT_SECRET,
			profile(profile) {
				return {
					id: profile.data.id,
					name: profile.data.name,
					email: `${profile.data.username}@twitter.local`,
					image: profile.data.profile_image_url,
					username: profile.data.username,
				}
			},
		}),
	],
	session: {
		strategy: "database",
		maxAge: 24 * 60 * 60,
	},
	callbacks: {
		async session({ session, user }) {
			if (session.user && user) {
				const dbUser = await prisma.user.findUnique({
					where: { id: user.id },
					select: {
						id: true,
						twitterId: true,
						username: true,
						name: true,
						profileImageUrl: true
					}
				})

				if (dbUser) {
					session.user = {
						...session.user,
						id: dbUser.id,
						twitterId: dbUser.twitterId,
						username: dbUser.username,
						name: dbUser.name,
						image: dbUser.profileImageUrl,
					} as any
				}
			}

			return session
		},
	},
	pages: {
		signIn: "/",
		error: "/",
	},
	secret: env.AUTH_SECRET,
})