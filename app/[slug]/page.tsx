import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { userAgent } from 'next/server';
import { Metadata } from 'next';

export async function generateMetadata(
    { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
    const { slug } = await params;
    const app = await prisma.app.findUnique({
        where: { slug },
    });

    if (!app) {
        return {
            title: 'App Not Found',
        };
    }

    return {
        title: app.ogTitle || app.name,
        description: app.ogDescription || app.description,
        openGraph: {
            title: app.ogTitle || app.name,
            description: app.ogDescription || app.description || undefined,
            images: app.ogImage ? [{ url: app.ogImage }] : undefined,
        },
        twitter: {
            card: 'summary_large_image',
            title: app.ogTitle || app.name,
            description: app.ogDescription || app.description || undefined,
            images: app.ogImage ? [app.ogImage] : undefined,
        },
    };
}

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

    // Extract Location
    let country = headersList.get('x-vercel-ip-country') || null;
    let city = headersList.get('x-vercel-ip-city') ? decodeURIComponent(headersList.get('x-vercel-ip-city')!) : null;

    // If no Vercel headers (e.g. self-hosted), try IP-based lookup
    if (!country) {
        try {
            const ip = headersList.get('x-forwarded-for')?.split(',')[0] || '127.0.0.1';
            // Skip lookup for localhost to avoid errors/waste
            if (ip !== '127.0.0.1' && ip !== '::1') {
                const geoRes = await fetch(`http://ip-api.com/json/${ip}?fields=country,city`, {
                    next: { revalidate: 3600 }, // Cache for 1 hour
                    signal: AbortSignal.timeout(1000), // 1s timeout to not block redirect
                });
                if (geoRes.ok) {
                    const geoData = await geoRes.json();
                    if (geoData.country) country = geoData.country;
                    if (geoData.city) city = geoData.city;
                }
            }
        } catch (e) {
            // Ignore errors (timeout, etc) to keep redirection fast
            console.error('Geo lookup failed:', e);
        }
    }

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
            country,
            city,
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
