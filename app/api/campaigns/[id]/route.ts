import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await auth();
    if (!session?.user) {
        return new NextResponse('Unauthorized', { status: 401 });
    }

    try {
        const { id } = await params;

        await prisma.campaign.delete({
            where: {
                id,
            },
        });

        return new NextResponse(null, { status: 204 });
    } catch (error) {
        console.error('[CAMPAIGN_DELETE]', error);
        return new NextResponse('Internal Error', { status: 500 });
    }
}
