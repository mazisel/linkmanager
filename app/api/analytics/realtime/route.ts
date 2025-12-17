import { NextResponse } from 'next/server';
import { getRealtimeActiveUsers } from '@/lib/analytics';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const propertyId = searchParams.get('propertyId');
        const data = await getRealtimeActiveUsers(propertyId || undefined);

        if (!data) {
            // If data is null, it might mean GA is not configured.
            // We return a 200 with specific payload to indicate no configuration or error without breaking the frontend
            return NextResponse.json({
                activeUsers: 0,
                breakdown: [],
                configured: false,
                message: 'Google Analytics not configured or failed to fetch.'
            });
        }

        return NextResponse.json({
            ...data,
            configured: true
        });
    } catch (error) {
        console.error('API Error fetching realtime analytics:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
