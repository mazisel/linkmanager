import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

export async function GET() {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const settings = await prisma.settings.findUnique({
            where: { userId: session.user.id },
        });

        // Return default settings if none exist
        if (!settings) {
            return NextResponse.json({
                siteTitle: "App Showcase",
                siteDescription: "Discover our latest mobile applications. Download directly for your device.",
                showAdminLink: false
            });
        }

        return NextResponse.json(settings);
    } catch (error) {
        console.error('Error fetching settings:', error);
        return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { siteTitle, siteDescription, showAdminLink } = body;

        const settings = await prisma.settings.upsert({
            where: { userId: session.user.id },
            update: {
                siteTitle,
                siteDescription,
                showAdminLink,
            },
            create: {
                userId: session.user.id,
                siteTitle,
                siteDescription,
                showAdminLink,
            },
        });

        return NextResponse.json(settings);
    } catch (error) {
        console.error('Error updating settings:', error);
        return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
    }
}
