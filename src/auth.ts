import NextAuth from "next-auth"
import authConfig from "@/auth.config"
import { prisma } from "@/lib/prisma"

export const { handlers, auth, signIn, signOut } = NextAuth({
	...authConfig,
	pages: {
		signIn: "/",
		error: "/",
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
