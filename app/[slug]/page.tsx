import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { userAgent } from 'next/server';

export default async function Page({
    params,
}: {
    params: Promise<{ slug: string }>;
}) {
    const { slug } = await params;
    const app = await prisma.app.findUnique({
        where: { slug },
    });

    if (!app) {
        return <div>App not found</div>;
    }

    const headersList = await headers();
    const userAgentString = headersList.get('user-agent') || '';

    // Simple device detection
    let deviceType = 'Desktop';
    if (/android/i.test(userAgentString)) {
        deviceType = 'Android';
    } else if (/iPad|iPhone|iPod/.test(userAgentString)) {
        deviceType = 'iOS';
    }

    // Log visit (fire and forget - ideally this should be a background job or separate API call to not block, 
    // but for simplicity we await it or just let it run. Since it's server component, we should await to ensure it runs)
    await prisma.visit.create({
        data: {
            appId: app.id,
            userAgent: userAgentString,
            deviceType: deviceType,
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
