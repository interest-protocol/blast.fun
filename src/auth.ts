import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import authConfig from "@/auth.config"
import { prisma } from "@/lib/prisma"

const adapter = {
	...PrismaAdapter(prisma),

	async createUser(data: any) {
		const { id, name, username, image, twitterId } = data

		const user = await prisma.user.create({
			data: {
				id: id || twitterId,
				name,
				username,
				profileImageUrl: image,
				twitterId,
			},
		})

		return {
			...user,
			email: `${user.username}@twitter.local`,
			emailVerified: null,
		}
	},

	async getUser(id: string) {
		const user = await prisma.user.findUnique({ where: { id } })
		if (!user) return null

		return {
			...user,
			email: `${user.username}@twitter.local`,
			emailVerified: null,
		}
	},

	async getUserByAccount({ providerAccountId, provider }: { providerAccountId: string; provider: string }) {
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
		}
	},

	async updateUser(data: any) {
		const { image, ...rest } = data

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
		}
	},

	async getUserByEmail() {
		return null
	},
}

export const { handlers, auth, signIn, signOut } = NextAuth({
	...authConfig,
	adapter,
	session: {
		strategy: "database",
		maxAge: 24 * 60 * 60,
	},
	pages: {
		signIn: "/",
		error: "/",
	},
	cookies: {
		sessionToken: {
			name: `next-auth.session-token`,
			options: {
				httpOnly: true,
				sameSite: "lax",
				path: "/",
				secure: false, // @dev: Set to false for localhost
			},
		},
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
						profileImageUrl: true,
					},
				})

				if (dbUser) {
					session.user = {
						...session.user,
						id: dbUser.id,
						twitterId: dbUser.twitterId,
						username: dbUser.username,
						name: dbUser.name,
						image: dbUser.profileImageUrl,
					}
				}
			}

			return session
		},
	},
})