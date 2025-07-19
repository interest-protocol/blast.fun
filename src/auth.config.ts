import { User, type NextAuthConfig } from "next-auth";
import Twitter from "next-auth/providers/twitter";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import { env } from "@/env";

const adapter = {
    ...PrismaAdapter(prisma),

    async createUser(data: any) {
        const { id, name, username, image, twitterId } = data;

        const user = await prisma.user.create({
            data: {
                id,
                name,
                username,
                profileImageUrl: image,
                twitterId
            }
        });

        return {
            ...user,
            email: `${user.username}@twitter.local`,
            emailVerified: null,
        }
    },

    async getUser(id: string) {
        const user = await prisma.user.findUnique({ where: { id } });
        if (!user) return null;

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
            emailVerified: null
        }
    },

    async updateUser(data: any) {
        const { image, ...rest } = data;

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
        return null;
    }
}

export default {
    adapter,
    session: {
        strategy: "database",
        maxAge: 24 * 60 * 60,
    },
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
} satisfies NextAuthConfig;