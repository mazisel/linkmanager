import { NextResponse } from 'next/server';
import { getBatchRealtimeActiveUsers } from '@/lib/analytics';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { appIds } = body;

        if (!Array.isArray(appIds) || appIds.length === 0) {
            return NextResponse.json({ error: 'Invalid appIds' }, { status: 400 });
        }

        // Fetch property IDs for these apps to ensure security and validity
        const apps = await prisma.app.findMany({
            where: {
                id: { in: appIds },
                userId: session.user.id
            },
            select: { id: true, ga4PropertyId: true }
        });

        // Filter out apps without property IDs
        const appsWithProps = apps
            .filter(app => app.ga4PropertyId)
            .map(app => ({ appId: app.id, propertyId: app.ga4PropertyId! }));

        if (appsWithProps.length === 0) {
            return NextResponse.json([]);
        }

        const results = await getBatchRealtimeActiveUsers(appsWithProps);
        return NextResponse.json(results);

    } catch (error) {
        console.error('Error fetching batch realtime analytics:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
