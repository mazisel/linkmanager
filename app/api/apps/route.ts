import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

export async function GET() {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const apps = await prisma.app.findMany({
            where: { userId: session.user.id },
            orderBy: { createdAt: 'desc' },
            include: {
                _count: {
                    select: { visits: true },
                },
            },
        });
        return NextResponse.json(apps);
    } catch (error) {
        console.error('Error fetching apps:', error);
        return NextResponse.json({ error: 'Failed to fetch apps' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { name, slug, androidUrl, iosUrl, fallbackUrl } = body;

        const app = await prisma.app.create({
            data: {
                name,
                slug,
                androidUrl,
                iosUrl,
                fallbackUrl,
                userId: session.user.id,
            },
        });
        return NextResponse.json(app, { status: 201 });
    } catch (error) {
        console.error('Error creating app:', error);
        return NextResponse.json({ error: error instanceof Error ? error.message : 'Failed to create app' }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        const body = await request.json();
        const { id, name, slug, androidUrl, iosUrl, fallbackUrl } = body;

        const app = await prisma.app.update({
            where: { id },
            data: {
                name,
                slug,
                androidUrl,
                iosUrl,
                fallbackUrl,
            },
        });
        return NextResponse.json(app);
    } catch (error) {
        console.error('Error updating app:', error);
        return NextResponse.json({ error: 'Failed to update app' }, { status: 500 });
    }
}
