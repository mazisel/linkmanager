import { prisma } from '@/lib/prisma';

export async function getDashboardStats(userId: string) {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfYesterday = new Date(startOfToday);
    startOfYesterday.setDate(startOfYesterday.getDate() - 1);
    const endOfYesterday = new Date(startOfToday);

    // Get all user's apps
    const userApps = await prisma.app.findMany({
        where: { userId },
        select: { id: true, name: true, slug: true, ga4PropertyId: true }
    });

    const appIds = userApps.map(app => app.id);

    // 1. Total Clicks Today
    const todayVisits = await prisma.visit.count({
        where: {
            appId: { in: appIds },
            timestamp: { gte: startOfToday }
        }
    });

    // 2. Total Clicks Yesterday (for comparison)
    const yesterdayVisits = await prisma.visit.count({
        where: {
            appId: { in: appIds },
            timestamp: {
                gte: startOfYesterday,
                lt: endOfYesterday
            }
        }
    });

    // 3. Top Apps (Last 30 Days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(now.getDate() - 30);

    const topAppsData = await prisma.visit.groupBy({
        by: ['appId'],
        where: {
            appId: { in: appIds },
            timestamp: { gte: thirtyDaysAgo }
        },
        _count: {
            id: true
        },
        orderBy: {
            _count: {
                id: 'desc'
            }
        },
        take: 5
    });

    // Map top apps data to app details
    const topApps = topAppsData.map(item => {
        const app = userApps.find(a => a.id === item.appId);
        return {
            id: item.appId,
            name: app?.name || 'Unknown App',
            slug: app?.slug || '',
            clicks: item._count.id
        };
    });

    return {
        todayVisits,
        yesterdayVisits,
        topApps,
        userApps // Return list of apps for frontend to request real-time data
    };
}
