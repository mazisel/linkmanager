import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;
        const url = new URL(request.url);
        const startDate = url.searchParams.get('startDate');
        const endDate = url.searchParams.get('endDate');

        const visitsWhere: any = {};
        if (startDate && endDate) {
            visitsWhere.timestamp = {
                gte: new Date(startDate),
                lte: new Date(endDate),
            };
        }

        const app = await prisma.app.findUnique({
            where: { id },
            include: {
                visits: {
                    where: visitsWhere
                }
            },
        });

        if (!app) {
            return NextResponse.json({ error: 'App not found' }, { status: 404 });
        }

        if (app.userId && app.userId !== session.user.id) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        return NextResponse.json(app);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch app' }, { status: 500 });
    }
}

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;

        // Verify ownership
        const existingApp = await prisma.app.findUnique({ where: { id } });
        if (!existingApp) return NextResponse.json({ error: 'App not found' }, { status: 404 });
        if (existingApp.userId && existingApp.userId !== session.user.id) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const body = await request.json();
        const { name, slug, description, androidUrl, iosUrl, fallbackUrl, ogTitle, ogDescription, ogImage, ga4PropertyId } = body;

        const app = await prisma.app.update({
            where: { id },
            data: {
                name,
                slug,
                description,
                androidUrl,
                iosUrl,
                fallbackUrl,
                ogTitle,
                ogDescription,
                ogImage,
                ga4PropertyId,
            },
        });
        return NextResponse.json(app);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to update app' }, { status: 500 });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;

        // Verify ownership
        const existingApp = await prisma.app.findUnique({ where: { id } });
        if (!existingApp) return NextResponse.json({ error: 'App not found' }, { status: 404 });
        if (existingApp.userId && existingApp.userId !== session.user.id) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        await prisma.app.delete({
            where: { id },
        });
        return NextResponse.json({ message: 'App deleted' });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete app' }, { status: 500 });
    }
}
