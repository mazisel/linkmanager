'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

interface Visit {
    id: string;
    deviceType: string;
    timestamp: string;
    referrer?: string;
    utmSource?: string;
    utmMedium?: string;
    utmCampaign?: string;
}

interface AppDetails {
    id: string;
    name: string;
    slug: string;
    visits: Visit[];
}

export default function AppDetailsPage() {
    const params = useParams();
    const { id } = params;
    const [app, setApp] = useState<AppDetails | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(`/api/apps/${id}`)
            .then((res) => res.json())
            .then((data) => {
                setApp(data);
                setLoading(false);
            });
    }, [id]);

    if (loading) return <div className="p-8 text-center">Loading...</div>;
    if (!app) return <div className="p-8 text-center">App not found</div>;

    // Calculate stats
    const totalVisits = app.visits?.length || 0;

    const calculateStats = (key: keyof Visit) => {
        return app.visits?.reduce((acc: any, visit) => {
            const value = visit[key] || 'Direct / Unknown';
            acc[value] = (acc[value] || 0) + 1;
            return acc;
        }, {});
    };

    const deviceStats = calculateStats('deviceType');
    const referrerStats = calculateStats('referrer');
    const utmSourceStats = calculateStats('utmSource');
    const utmMediumStats = calculateStats('utmMedium');
    const utmCampaignStats = calculateStats('utmCampaign');

    const renderProgressBar = (count: number, total: number, colorClass: string = 'bg-blue-600') => (
        <div className="w-full bg-gray-200 rounded-full h-2.5 mt-1">
            <div
                className={`${colorClass} h-2.5 rounded-full`}
                style={{ width: `${(count / total) * 100}%` }}
            ></div>
        </div>
    );

    const renderStatSection = (title: string, stats: any, colorClass: string = 'bg-blue-600') => (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h3 className="text-lg font-bold text-gray-800 mb-4">{title}</h3>
            <div className="space-y-4">
                {stats && Object.entries(stats)
                    .sort(([, a]: any, [, b]: any) => b - a)
                    .slice(0, 5) // Top 5
                    .map(([label, count]: [string, any]) => (
                        <div key={label}>
                            <div className="flex justify-between text-sm mb-1">
                                <span className="font-medium text-gray-700 truncate max-w-[200px]" title={label}>{label}</span>
                                <span className="text-gray-500">{count} ({Math.round((count / totalVisits) * 100)}%)</span>
                            </div>
                            {renderProgressBar(count, totalVisits, colorClass)}
                        </div>
                    ))}
                {(!stats || Object.keys(stats).length === 0) && (
                    <p className="text-gray-400 text-sm">No data available</p>
                )}
            </div>
        </div>
    );

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-gray-800">{app.name} Analytics</h2>
                <div className="text-sm text-gray-500">
                    Slug: <span className="font-mono bg-gray-100 px-2 py-1 rounded">/{app.slug}</span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <h3 className="text-gray-500 text-sm font-medium uppercase">Total Clicks</h3>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{totalVisits}</p>
                </div>
                {/* Add more summary cards if needed */}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {renderStatSection('Device Breakdown', deviceStats, 'bg-indigo-500')}
                {renderStatSection('Top Referrers', referrerStats, 'bg-green-500')}
                {renderStatSection('UTM Sources', utmSourceStats, 'bg-purple-500')}
                {renderStatSection('UTM Mediums', utmMediumStats, 'bg-orange-500')}
                {renderStatSection('UTM Campaigns', utmCampaignStats, 'bg-pink-500')}
            </div>
        </div>
    );
}
