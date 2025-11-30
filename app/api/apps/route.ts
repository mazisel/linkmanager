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
        const { name, slug, description, androidUrl, iosUrl, fallbackUrl, logoUrl, ogTitle, ogDescription, ogImage } = body;

        // Basic validation
        if (!name || !slug) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        const app = await prisma.app.create({
            data: {
                name,
                slug,
                description,
                androidUrl,
                iosUrl,
                fallbackUrl,
                logoUrl,
                ogTitle,
                ogDescription,
                ogImage,
                userId: session.user.id,
            },
        });
        return NextResponse.json(app, { status: 201 });
    } catch (error: any) {
        console.error('Error creating app:', error);
        if (error.code === 'P2002' && error.meta?.target?.includes('slug')) {
            return NextResponse.json({ error: 'This short link (slug) is already taken. Please choose another one.' }, { status: 409 });
        }
        return NextResponse.json({ error: error instanceof Error ? error.message : 'Failed to create app' }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        const body = await request.json();
        const { id, name, slug, description, androidUrl, iosUrl, fallbackUrl, logoUrl, ogTitle, ogDescription, ogImage } = body;

        const updatedApp = await prisma.app.update({
            where: { id },
            data: {
                name,
                slug,
                description,
                androidUrl,
                iosUrl,
                fallbackUrl,
                logoUrl,
                ogTitle,
                ogDescription,
                ogImage,
            },
        });
        return NextResponse.json(updatedApp);
    } catch (error: any) {
        console.error('Error updating app:', error);
        if (error.code === 'P2002' && error.meta?.target?.includes('slug')) {
            return NextResponse.json({ error: 'This short link (slug) is already taken. Please choose another one.' }, { status: 409 });
        }
        return NextResponse.json({ error: 'Failed to update app' }, { status: 500 });
    }
}
