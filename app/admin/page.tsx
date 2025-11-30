'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface App {
    id: string;
    name: string;
    slug: string;
    androidUrl: string;
    iosUrl: string;
    _count: {
        visits: number;
    };
}

function CopyButton({ slug }: { slug: string }) {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        const url = `${window.location.origin}/${slug}`;
        try {
            await navigator.clipboard.writeText(url);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
            // Fallback for non-secure contexts or failures
            prompt('Copy this link:', url);
        }
    };

    return (
        <button
            onClick={handleCopy}
            className={`${copied ? 'text-green-700 font-bold' : 'text-green-600 hover:text-green-900'} mr-4 transition-colors`}
        >
            {copied ? 'Copied!' : 'Copy'}
        </button>
    );
}

export default function Dashboard() {
    const [apps, setApps] = useState<App[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/apps')
            .then((res) => res.json())
            .then((data) => {
                if (Array.isArray(data)) {
                    setApps(data);
                } else {
                    console.error('Failed to fetch apps:', data);
                    setApps([]);
                }
                setLoading(false);
            })
            .catch((err) => {
                console.error('Error fetching apps:', err);
                setApps([]);
                setLoading(false);
            });
    }, []);

    if (loading) return (
        <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
    );

    return (
        <div>
            <div className="flex justify-between items-center mb-6 md:mb-8">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-800">Dashboard</h2>
                <Link
                    href="/admin/new"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                >
                    Create New Link
                </Link>
            </div>

            {apps.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
                    <p className="text-gray-500 mb-4">No apps created yet</p>
                    <Link
                        href="/admin/new"
                        className="text-blue-600 hover:text-blue-700 font-medium"
                    >
                        Create your first app link
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {apps.map((app) => (
                        <div key={app.id} className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="font-bold text-gray-900 text-lg">{app.name}</h3>
                                    <p className="text-gray-500 text-sm font-mono mt-1">/{app.slug}</p>
                                </div>
                                <div className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-bold">
                                    {app._count.visits} clicks
                                </div>
                            </div>

                            <div className="flex items-center justify-between pt-4 border-t border-gray-100 mt-4">
                                <CopyButton slug={app.slug} />
                                <div className="flex gap-3">
                                    <Link
                                        href={`/admin/apps/${app.id}`}
                                        className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors"
                                    >
                                        Analytics
                                    </Link>
                                    <Link
                                        href={`/admin/apps/${app.id}/edit`}
                                        className="text-sm font-medium text-gray-600 hover:text-indigo-600 transition-colors"
                                    >
                                        Edit
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
