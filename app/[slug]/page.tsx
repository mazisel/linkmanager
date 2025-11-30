import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { userAgent } from 'next/server';

export default async function Page({
    params,
    searchParams,
}: {
    params: Promise<{ slug: string }>;
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
    const { slug } = await params;
    const resolvedSearchParams = await searchParams;

    const app = await prisma.app.findUnique({
        where: { slug },
    });

    if (!app) {
        return <div>App not found</div>;
    }

    const headersList = await headers();
    const userAgentString = headersList.get('user-agent') || '';
    const referrer = headersList.get('referer') || null;

    // Extract UTM parameters
    const utmSource = resolvedSearchParams['utm_source'] as string || null;
    const utmMedium = resolvedSearchParams['utm_medium'] as string || null;
    const utmCampaign = resolvedSearchParams['utm_campaign'] as string || null;
    const utmTerm = resolvedSearchParams['utm_term'] as string || null;
    const utmContent = resolvedSearchParams['utm_content'] as string || null;

    // Simple device detection
    let deviceType = 'Desktop';
    if (/android/i.test(userAgentString)) {
        deviceType = 'Android';
    } else if (/iPad|iPhone|iPod/.test(userAgentString)) {
        deviceType = 'iOS';
    }

    // Log visit
    await prisma.visit.create({
        data: {
            appId: app.id,
            userAgent: userAgentString,
            deviceType: deviceType,
            referrer,
            utmSource,
            utmMedium,
            utmCampaign,
            utmTerm,
            utmContent,
        },
    });

    if (deviceType === 'Android' && app.androidUrl) {
        redirect(app.androidUrl);
    } else if (deviceType === 'iOS' && app.iosUrl) {
        redirect(app.iosUrl);
    } else if (app.fallbackUrl) {
        redirect(app.fallbackUrl);
    }

    // Fallback UI if no redirect happens (e.g. desktop with no fallback URL)
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
            <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center">
                <h1 className="text-2xl font-bold mb-6 text-gray-800">{app.name}</h1>
                <div className="space-y-4">
                    {app.iosUrl && (
                        <a
                            href={app.iosUrl}
                            className="block w-full py-3 px-4 bg-black text-white rounded-lg font-medium hover:bg-gray-800 transition-colors"
                        >
                            Download on the App Store
                        </a>
                    )}
                    {app.androidUrl && (
                        <a
                            href={app.androidUrl}
                            className="block w-full py-3 px-4 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
                        >
                            Get it on Google Play
                        </a>
                    )}
                </div>
            </div>
        </div>
    );
}
