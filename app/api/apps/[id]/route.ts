import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const app = await prisma.app.findUnique({
            where: { id },
            include: { visits: true },
        });
        if (!app) {
            return NextResponse.json({ error: 'App not found' }, { status: 404 });
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
        const { id } = await params;
        const body = await request.json();
        const { name, slug, androidUrl, iosUrl, fallbackUrl } = body;

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
        return NextResponse.json({ error: 'Failed to update app' }, { status: 500 });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        await prisma.app.delete({
            where: { id },
        });
        return NextResponse.json({ message: 'App deleted' });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete app' }, { status: 500 });
    }
}
