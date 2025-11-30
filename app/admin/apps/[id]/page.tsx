'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Smartphone, Globe, MousePointer, Layers, Hash, Tag } from 'lucide-react';
import CampaignManager from '../../components/CampaignManager';

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

    if (loading) return (
        <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
    );
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
        <div className="w-full bg-gray-100 rounded-full h-2 mt-1.5">
            <div
                className={`${colorClass} h-2 rounded-full transition-all duration-500`}
                style={{ width: `${(count / total) * 100}%` }}
            ></div>
        </div>
    );

    const renderStatSection = (title: string, icon: any, stats: any, colorClass: string = 'bg-blue-600') => {
        const Icon = icon;
        return (
            <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
                <div className="flex items-center gap-2 mb-4">
                    <div className={`p-2 rounded-lg ${colorClass.replace('bg-', 'bg-opacity-10 text-').replace('500', '600')}`}>
                        <Icon size={20} />
                    </div>
                    <h3 className="text-lg font-bold text-gray-800">{title}</h3>
                </div>
                <div className="space-y-4">
                    {stats && Object.entries(stats)
                        .sort(([, a]: any, [, b]: any) => b - a)
                        .slice(0, 5) // Top 5
                        .map(([label, count]: [string, any]) => (
                            <div key={label}>
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="font-medium text-gray-700 truncate max-w-[150px] md:max-w-[200px]" title={label}>{label}</span>
                                    <span className="text-gray-500 text-xs">{count} ({Math.round((count / totalVisits) * 100)}%)</span>
                                </div>
                                {renderProgressBar(count, totalVisits, colorClass)}
                            </div>
                        ))}
                    {(!stats || Object.keys(stats).length === 0) && (
                        <p className="text-gray-400 text-sm italic">No data available</p>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-6 md:space-y-8">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                <div>
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-800">{app.name}</h2>
                    <div className="text-sm text-gray-500 mt-1">
                        Slug: <span className="font-mono bg-gray-100 px-2 py-0.5 rounded text-gray-700">/{app.slug}</span>
                    </div>
                </div>
                <div className="bg-white px-6 py-3 rounded-xl shadow-sm border border-gray-200 flex items-center gap-3">
                    <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                        <MousePointer size={24} />
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Total Clicks</p>
                        <p className="text-2xl font-bold text-gray-900 leading-none">{totalVisits}</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {renderStatSection('Device Breakdown', Smartphone, deviceStats, 'bg-indigo-500')}
                {renderStatSection('Top Referrers', Globe, referrerStats, 'bg-green-500')}
                {renderStatSection('UTM Sources', Layers, utmSourceStats, 'bg-purple-500')}
                {renderStatSection('UTM Mediums', Hash, utmMediumStats, 'bg-orange-500')}
                {renderStatSection('UTM Campaigns', Tag, utmCampaignStats, 'bg-pink-500')}
            </div>

            <CampaignManager appId={app.id} appSlug={app.slug} />
        </div>
    );
}
