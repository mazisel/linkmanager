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

        const visitsWhere: any = { appId: id };
        if (startDate && endDate) {
            visitsWhere.timestamp = {
                gte: new Date(startDate),
                lte: new Date(endDate),
            };
        }

        // 1. Get Access Check & Basic App Info
        const app = await prisma.app.findUnique({
            where: { id },
            select: {
                id: true,
                name: true,
                slug: true,
                userId: true,
                // Add any other fields you need for the "header" of the page
                description: true,
                logoUrl: true,
                androidUrl: true,
                iosUrl: true,
                fallbackUrl: true,
                ga4PropertyId: true,
            }
        });

        if (!app) {
            return NextResponse.json({ error: 'App not found' }, { status: 404 });
        }

        if (app.userId && app.userId !== session.user.id) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        // 2. Aggregate Data using db-n8n (Prisma)
        const [
            totalVisits,
            deviceStats,
            referrerStats,
            countryStats,
            cityStats,
            utmSourceStats,
            utmMediumStats,
            utmCampaignStats
        ] = await Promise.all([
            prisma.visit.count({ where: visitsWhere }),
            prisma.visit.groupBy({
                by: ['deviceType'],
                where: visitsWhere,
                _count: { deviceType: true },
                orderBy: { _count: { deviceType: 'desc' } },
                take: 10,
            }),
            prisma.visit.groupBy({
                by: ['referrer'],
                where: visitsWhere,
                _count: { referrer: true },
                orderBy: { _count: { referrer: 'desc' } },
                take: 10,
            }),
            prisma.visit.groupBy({
                by: ['country'],
                where: visitsWhere,
                _count: { country: true },
                orderBy: { _count: { country: 'desc' } },
                take: 10,
            }),
            prisma.visit.groupBy({
                by: ['city'],
                where: visitsWhere,
                _count: { city: true },
                orderBy: { _count: { city: 'desc' } },
                take: 10,
            }),
            prisma.visit.groupBy({
                by: ['utmSource'],
                where: visitsWhere,
                _count: { utmSource: true },
                orderBy: { _count: { utmSource: 'desc' } },
                take: 10,
            }),
            prisma.visit.groupBy({
                by: ['utmMedium'],
                where: visitsWhere,
                _count: { utmMedium: true },
                orderBy: { _count: { utmMedium: 'desc' } },
                take: 10,
            }),
            prisma.visit.groupBy({
                by: ['utmCampaign'],
                where: visitsWhere,
                _count: { utmCampaign: true },
                orderBy: { _count: { utmCampaign: 'desc' } },
                take: 10,
            }),
        ]);

        // Helper to transform Prisma groupBy result to simple object map
        const transformStats = (data: any[], key: string) => {
            return data.reduce((acc: any, item: any) => {
                const label = item[key] || 'Unknown';
                acc[label] = item._count[key];
                return acc;
            }, {});
        };

        const stats = {
            totalVisits,
            deviceType: transformStats(deviceStats, 'deviceType'),
            referrer: transformStats(referrerStats, 'referrer'),
            country: transformStats(countryStats, 'country'),
            city: transformStats(cityStats, 'city'),
            utmSource: transformStats(utmSourceStats, 'utmSource'),
            utmMedium: transformStats(utmMediumStats, 'utmMedium'),
            utmCampaign: transformStats(utmCampaignStats, 'utmCampaign'),
        };

        return NextResponse.json({ ...app, stats });
    } catch (error) {
        console.error('Analytics error:', error);
        return NextResponse.json({ error: 'Failed to fetch app stats' }, { status: 500 });
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
