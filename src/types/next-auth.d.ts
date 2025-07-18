declare module "next-auth" {
  interface Session {
    user: {
      id: string
      twitterId: string
      username: string
      name: string | null
      image: string | null
    }
  }

  interface User {
    id: string
    twitterId: string
    username: string
    name?: string | null
    profileImageUrl?: string | null
  }
}