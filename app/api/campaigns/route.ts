import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    const session = await auth();
    if (!session?.user) {
        return new NextResponse('Unauthorized', { status: 401 });
    }

    try {
        const body = await req.json();
        const { name, appId, utmSource, utmMedium, utmCampaign, utmTerm, utmContent } = body;

        if (!name || !appId) {
            return new NextResponse('Missing required fields', { status: 400 });
        }

        const campaign = await prisma.campaign.create({
            data: {
                name,
                appId,
                utmSource,
                utmMedium,
                utmCampaign,
                utmTerm,
                utmContent,
            },
        });

        return NextResponse.json(campaign);
    } catch (error) {
        console.error('[CAMPAIGNS_POST]', error);
        return new NextResponse('Internal Error', { status: 500 });
    }
}

export async function GET(req: Request) {
    const session = await auth();
    if (!session?.user) {
        return new NextResponse('Unauthorized', { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const appId = searchParams.get('appId');

    try {
        const campaigns = await prisma.campaign.findMany({
            where: {
                ...(appId ? { appId } : {}),
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        return NextResponse.json(campaigns);
    } catch (error) {
        console.error('[CAMPAIGNS_GET]', error);
        return new NextResponse('Internal Error', { status: 500 });
    }
}
