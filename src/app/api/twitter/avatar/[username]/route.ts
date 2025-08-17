import { NextRequest, NextResponse } from "next/server"

interface FxTwitterUser {
  screen_name: string
  avatar_url: string
  name: string
  id: string
}

interface FxTwitterResponse {
  code: number
  message: string
  user?: FxTwitterUser
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ username: string }> }
) {
  try {
    const { username } = await context.params
    
    if (!username) {
      return NextResponse.json(
        { error: "Username is required" },
        { status: 400 }
      )
    }

    // Fetch from fxtwitter API
    const response = await fetch(`https://api.fxtwitter.com/${username}`, {
      next: { 
        revalidate: 3600, // Cache for 1 hour
        tags: [`twitter-avatar-${username}`]
      },
    })

    if (!response.ok) {
      throw new Error(`FxTwitter API error: ${response.status}`)
    }

    const data: FxTwitterResponse = await response.json()

    if (data.code !== 200 || !data.user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      )
    }

    // Extract the high-quality avatar URL
    let avatarUrl = data.user.avatar_url
    if (avatarUrl) {
      // Replace size variants with highest quality
      avatarUrl = avatarUrl
        .replace("_normal.", "_400x400.")
        .replace("_bigger.", "_400x400.")
        .replace("_mini.", "_400x400.")
        .replace("_200x200.", "_400x400.")
    }

    return NextResponse.json({
      id: data.user.id,
      username: data.user.screen_name,
      name: data.user.name,
      avatar_url: avatarUrl,
    }, {
      headers: {
        'Cache-Control': 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400',
        'CDN-Cache-Control': 'max-age=3600',
        'Vercel-CDN-Cache-Control': 'max-age=3600',
      },
    })
  } catch (error) {
    console.error("Error fetching Twitter avatar:", error)
    return NextResponse.json(
      { error: "Failed to fetch Twitter data" },
      { status: 500 }
    )
  }
}