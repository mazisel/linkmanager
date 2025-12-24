
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
    try {
        // Basic auth check - in a real app should verify admin role
        const session = await auth();
        if (!session?.user?.id) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const currenTime = new Date().toISOString();

        const [users, apps, campaigns, visits, accounts, sessions, settings] = await Promise.all([
            prisma.user.findMany(),
            prisma.app.findMany(),
            prisma.campaign.findMany(),
            prisma.visit.findMany(),
            prisma.account.findMany(),
            prisma.session.findMany(),
            prisma.settings.findMany(),
        ]);

        const data = {
            meta: {
                exportedAt: currenTime,
                version: "1.0"
            },
            data: {
                users,
                apps,
                campaigns,
                visits,
                accounts,
                sessions,
                settings
            }
        };

        return NextResponse.json(data);
    } catch (error) {
        console.error('[DATA_EXPORT_ERROR]', error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const body = await req.json();
        const { data } = body;

        if (!data) {
            return new NextResponse("Invalid data format", { status: 400 });
        }

        // Transaction to safely replace data
        await prisma.$transaction(async (tx) => {
            // Delete in reverse order of dependencies
            await tx.visit.deleteMany();
            await tx.campaign.deleteMany();
            await tx.app.deleteMany();
            await tx.settings.deleteMany(); // Settings depends on User
            await tx.session.deleteMany();
            await tx.account.deleteMany();
            await tx.user.deleteMany();

            // Restore in order of dependencies
            // Users
            if (data.users?.length > 0) {
                await tx.user.createMany({ data: data.users });
            }

            // Accounts
            if (data.accounts?.length > 0) {
                await tx.account.createMany({ data: data.accounts });
            }

            // Sessions
            if (data.sessions?.length > 0) {
                await tx.session.createMany({ data: data.sessions });
            }

            // Settings
            if (data.settings?.length > 0) {
                await tx.settings.createMany({ data: data.settings });
            }

            // Apps
            if (data.apps?.length > 0) {
                await tx.app.createMany({ data: data.apps });
            }

            // Campaigns
            if (data.campaigns?.length > 0) {
                await tx.campaign.createMany({ data: data.campaigns });
            }

            // Visits
            if (data.visits?.length > 0) {
                await tx.visit.createMany({ data: data.visits });
            }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('[DATA_IMPORT_ERROR]', error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
