import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/prisma"

const createReferralSchema = z.object({
    wallet: z.string().min(1),
    refCode: z.string().min(3).max(20).regex(/^[a-zA-Z0-9_-]+$/, {
        message: "Only letters, numbers, hyphens and underscores allowed"
    })
})

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams
    const refCode = searchParams.get("refCode")
    const wallet = searchParams.get("wallet")

    try {
        if (refCode) {
            const referral = await prisma.referral.findUnique({
                where: { referralCode: refCode }
            })
            if (referral) {
                return NextResponse.json({ wallet: referral.walletAddress })
            }
            return NextResponse.json({ error: "Referral code not found" }, { status: 404 })
        }

        if (wallet) {
            const referral = await prisma.referral.findUnique({
                where: { walletAddress: wallet }
            })
            if (referral) {
                return NextResponse.json({ refCode: referral.referralCode })
            }
            return NextResponse.json({ refCode: null })
        }

        return NextResponse.json({ error: "Missing refCode or wallet parameter" }, { status: 400 })
    } catch (error) {
        console.error("Error fetching referral:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { wallet, refCode } = createReferralSchema.parse(body)

        // check if wallet already has a referral code
        const existingReferral = await prisma.referral.findUnique({
            where: { walletAddress: wallet }
        })

        if (existingReferral) {
            return NextResponse.json({
                error: "WALLET::ALREADY_HAS_REFERRAL",
                refCode: existingReferral.referralCode,
                existing: true
            }, { status: 409 })
        }

        // check if the requested code is already taken
        const existingCode = await prisma.referral.findUnique({
            where: { referralCode: refCode }
        })

        if (existingCode) {
            return NextResponse.json({
                error: "CODE::ALREADY_TAKEN"
            }, { status: 409 })
        }

        const referral = await prisma.referral.create({
            data: {
                walletAddress: wallet,
                referralCode: refCode
            }
        })

        return NextResponse.json({ success: true, refCode: referral.referralCode })
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: "Invalid input", details: error.errors }, { status: 400 })
        }
        console.error("Error creating referral:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}