import { headers } from 'next/headers';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function ShowcasePage() {
    const apps = await prisma.app.findMany({
        orderBy: { createdAt: 'desc' },
    });

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
            {/* Header */}
            <header className="container mx-auto px-4 py-8 flex justify-between items-center border-b border-gray-800">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                    App Showcase
                </h1>
                <Link
                    href="/login"
                    className="text-sm text-gray-500 hover:text-white transition-colors"
                >
                    Admin Login
                </Link>
            </header>

            {/* Main Content */}
            <main className="container mx-auto px-4 py-12">
                <div className="text-center mb-16">
                    <h2 className="text-4xl md:text-5xl font-bold mb-4">{title}</h2>
                    <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                        Discover our latest mobile applications. Download directly for your device.
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
                                <div className="w-16 h-16 bg-gradient-to-br from-gray-800 to-black rounded-xl border border-gray-700 flex items-center justify-center text-2xl font-bold text-gray-500 group-hover:text-white transition-colors">
                                    {app.name.charAt(0)}
                                </div>
                                <span className="px-3 py-1 bg-gray-800 rounded-full text-xs font-medium text-gray-400 border border-gray-700">
                                    {app.slug}
                                </span>
                            </div>

                            <h3 className="text-xl font-bold mb-2 group-hover:text-blue-400 transition-colors">{app.name}</h3>
                            <p className="text-gray-500 text-sm mb-6 line-clamp-2">
                                Experience the best features with our {app.name} application.
                            </p>

                            <div className="space-y-3">
                                {(!isMobile || isIOS) && app.iosUrl && (
                                    <a
                                        href={app.iosUrl}
                                        className="block w-full py-3 px-4 bg-white text-black rounded-xl font-bold text-center hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
                                    >
                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.61-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.18 2.54zM15 8c.84-1.02 1.4-2.42 1.24-3.8-.4.06-1.63.79-2.57 1.96-.61.76-1.17 2.01-1.02 3.38.2.02 1.51.02 2.35-1.54z" /></svg>
                                        App Store
                                    </a>
                                )}
                                {(!isMobile || isAndroid) && app.androidUrl && (
                                    <a
                                        href={app.androidUrl}
                                        className="block w-full py-3 px-4 bg-transparent border border-gray-600 text-white rounded-xl font-bold text-center hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
                                    >
                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.523 15.3414c-.5511 0-.9993-.4486-.9993-.9997s.4482-.9993.9993-.9993c.5511 0 .9993.4482.9993.9993.0001.5511-.4482.9997-.9993.9997m-11.046 0c-.5511 0-.9993-.4486-.9993-.9997s.4482-.9993.9993-.9993c.5511 0 .9993.4482.9993.9993 0 .5511-.4482.9997-.9993.9997m11.4045-6.02l1.9973-3.4592a.416.416 0 00-.1521-.5676.416.416 0 00-.5676.1521l-2.0223 3.503C15.5902 8.2439 13.8533 7.8449 12 7.8449c-1.8532 0-3.5899.3989-5.1364 1.1048L4.8413 5.4469a.416.416 0 00-.5677-.1521.416.416 0 00-.1521.5676l1.9973 3.4592C2.6889 11.1867.3432 14.6589 0 18.761h24c-.3435-4.1021-2.6895-7.5743-6.1185-9.4396" /></svg>
                                        Google Play
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

            {/* Footer */}
            <footer className="container mx-auto px-4 py-8 text-center text-gray-600 text-sm">
                <p>&copy; {new Date().getFullYear()} App Link Manager. All rights reserved.</p>
            </footer>
        </div>
    );
}
