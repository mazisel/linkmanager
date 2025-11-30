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

    if (loading) return <div>Loading...</div>;

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <h2 className="text-3xl font-bold text-gray-800">Dashboard</h2>
                <Link
                    href="/admin/new"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                    Create New Link
                </Link>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                App Name
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Slug
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Total Clicks
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {apps.map((app) => (
                            <tr key={app.id}>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-gray-900">{app.name}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-500">/{app.slug}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-900">{app._count.visits}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    <a href={`/${app.slug}`} target="_blank" className="text-blue-600 hover:text-blue-900 mr-4">
                                        Test Link
                                    </a>
                                    <Link href={`/admin/apps/${app.id}`} className="text-indigo-600 hover:text-indigo-900">
                                        Analytics
                                    </Link>
                                    {/* Add Edit/Delete later */}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
