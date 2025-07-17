import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        const {
            poolObjectId,
            creatorAddress,
            twitterUserId,
            twitterUsername,
            hideIdentity,
            tokenTxHash,
            poolTxHash,
        } = body;

        if (!poolObjectId || !creatorAddress || !tokenTxHash || !poolTxHash) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        const tokenLaunch = await prisma.tokenLaunches.create({
            data: {
                poolObjectId,
                creatorAddress,
                twitterUserId,
                twitterUsername,
                hideIdentity: hideIdentity || false,
                tokenTxHash,
                poolTxHash,
            },
        });

        return NextResponse.json({ success: true, id: tokenLaunch.id });
    } catch (error) {
        console.error('Error saving token launch:', error);
        return NextResponse.json(
            { error: 'Failed to save token launch data' },
            { status: 500 }
        );
    }
}