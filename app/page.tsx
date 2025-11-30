import { headers } from 'next/headers';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function ShowcasePage() {
    const apps = await prisma.app.findMany({
        orderBy: { createdAt: 'desc' },
    });

    // Fetch settings (get the first one or default)
    const settings = await prisma.settings.findFirst();
    const siteTitle = settings?.siteTitle || "App Showcase";
    const siteDescription = settings?.siteDescription || "Discover our latest mobile applications. Download directly for your device.";
    const showAdminLink = settings?.showAdminLink ?? false;

    const headersList = await headers();
    const userAgent = headersList.get('user-agent') || '';

    const isAndroid = /android/i.test(userAgent);
    const isIOS = /iPad|iPhone|iPod/.test(userAgent);
    const isMobile = isAndroid || isIOS;

    // Filter apps based on device
    const androidApps = apps.filter(app => app.androidUrl);
    const iosApps = apps.filter(app => app.iosUrl);

    let displayedApps = apps;
    let title = "All Apps";

    if (isAndroid) {
        displayedApps = androidApps;
        title = "Android Apps";
    } else if (isIOS) {
        displayedApps = iosApps;
        title = "iOS Apps";
    }

    return (
        <div className="min-h-screen bg-black text-white selection:bg-blue-500 selection:text-white">
            {/* Header - Only show if admin link is enabled or if there's other content (currently empty if no admin link) */}
            {showAdminLink && (
                <header className="container mx-auto px-4 py-8 flex justify-end items-center border-b border-gray-800">
                    <Link
                        href="/login"
                        className="text-sm text-gray-500 hover:text-white transition-colors"
                    >
                        Admin Login
                    </Link>
                </header>
            )}

            {/* Main Content */}
            <main className="container mx-auto px-4 py-12">
                <div className="text-center mb-16">
                    <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                        {siteTitle}
                    </h1>
                    <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                        {siteDescription}
                    </p>
                </div>

                {!isMobile && (
                    <div className="mb-12 flex justify-center gap-4">
                        {/* Simple Tabs for Desktop */}
                        <div className="bg-gray-900 p-1 rounded-lg inline-flex">
                            <button className="px-6 py-2 rounded-md bg-gray-800 text-white shadow-sm">All</button>
                            <span className="px-6 py-2 text-gray-400 cursor-default">
                                (Open on mobile to see device-specific view)
                            </span>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {displayedApps.map((app) => (
                        <div
                            key={app.id}
                            className="group bg-gray-900 border border-gray-800 rounded-2xl p-6 hover:border-gray-700 transition-all hover:shadow-2xl hover:shadow-blue-900/20"
                        >
                            <div className="flex items-start justify-between mb-6">
                                {app.logoUrl ? (
                                    <div className="w-16 h-16 rounded-xl border border-gray-700 overflow-hidden bg-white">
                                        <img
                                            src={app.logoUrl}
                                            alt={app.name}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                ) : (
                                    <div className="w-16 h-16 bg-gradient-to-br from-gray-800 to-black rounded-xl border border-gray-700 flex items-center justify-center text-2xl font-bold text-gray-500 group-hover:text-white transition-colors">
                                        {app.name.charAt(0)}
                                    </div>
                                )}
                                <span className="px-3 py-1 bg-gray-800 rounded-full text-xs font-medium text-gray-400 border border-gray-700">
                                    {app.slug}
                                </span>
                            </div>

                            <h3 className="text-xl font-bold mb-2 group-hover:text-blue-400 transition-colors">{app.name}</h3>
                            <p className="text-gray-400 text-sm mb-6 line-clamp-3 h-10">
                                {app.description || `Experience the best features with our ${app.name} application.`}
                            </p>

                            <div className="space-y-3">
                                {(!isMobile || isIOS) && app.iosUrl && (
                                    <a
                                        href={app.iosUrl}
                                        className="block w-full py-3 px-4 bg-white/10 border border-white/20 text-white rounded-xl font-bold text-center hover:bg-white hover:text-black transition-all duration-300 flex items-center justify-center gap-3 group/btn"
                                    >
                                        <span>App Store</span>
                                    </a>
                                )}
                                {(!isMobile || isAndroid) && app.androidUrl && (
                                    <a
                                        href={app.androidUrl}
                                        className="block w-full py-3 px-4 bg-white/10 border border-white/20 text-white rounded-xl font-bold text-center hover:bg-[#3DDC84] hover:text-black hover:border-[#3DDC84] transition-all duration-300 flex items-center justify-center gap-3 group/btn"
                                    >
                                        <span>Google Play</span>
                                    </a>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {displayedApps.length === 0 && (
                    <div className="text-center py-20 text-gray-500">
                        <p className="text-xl">No apps available for your device.</p>
                    </div>
                )}
            </main>
        </div>
    );
}
