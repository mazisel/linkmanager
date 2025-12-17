'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Smartphone, Globe, MousePointer, Layers, Hash, Tag, Activity } from 'lucide-react';
import CampaignManager from '../../components/CampaignManager';

interface Visit {
    id: string;
    deviceType: string;
    timestamp: string;
    referrer?: string;
    utmSource?: string;
    utmMedium?: string;
    utmCampaign?: string;
    country?: string;
    city?: string;
}

interface AppDetails {
    id: string;
    name: string;
    slug: string;
    ga4PropertyId?: string;
    visits: Visit[];
}

function RealtimeWidget({ propertyId }: { propertyId?: string }) {
    const [data, setData] = useState<{ activeUsers: number; configured: boolean } | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = () => {
            const endpoint = propertyId
                ? `/api/analytics/realtime?propertyId=${propertyId}`
                : '/api/analytics/realtime';

            fetch(endpoint)
                .then((res) => res.json())
                .then((data) => {
                    setData(data);
                    setLoading(false);
                })
                .catch((err) => {
                    console.error('Failed to fetch realtime data', err);
                    setLoading(false);
                });
        };

        fetchData();
        const interval = setInterval(fetchData, 30000); // Poll every 30s
        return () => clearInterval(interval);
    }, []);

    if (loading) return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="h-10 bg-gray-200 rounded w-1/6"></div>
        </div>
    );

    if (!data?.configured) return (
        <div className="bg-amber-50 p-6 rounded-xl border border-amber-200">
            <div className="flex items-center gap-3 text-amber-800 mb-2">
                <Activity size={24} />
                <h3 className="font-bold text-lg">Google Analytics Real-time</h3>
            </div>
            <p className="text-amber-700">
                To view real-time data, please configure your Google Analytics credentials in the .env file.
            </p>
        </div>
    );

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 overflow-hidden relative">
            <div className="absolute top-0 right-0 p-4 opacity-10">
                <Activity size={100} className="text-blue-600" />
            </div>
            <div className="relative z-10">
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-blue-100 text-blue-600 rounded-lg animate-pulse">
                        <Activity size={24} />
                    </div>
                    <h3 className="font-bold text-lg text-gray-800">Real-time Active Users</h3>
                </div>
                <div className="flex items-end gap-3 mt-4">
                    <span className="text-5xl font-bold text-gray-900 leading-none">
                        {data.activeUsers}
                    </span>
                    <span className="text-gray-500 font-medium mb-1">right now</span>
                </div>
                <div className="mt-4 flex items-center gap-2 text-sm text-green-600 font-medium">
                    <span className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                    </span>
                    Live updates active
                </div>
            </div>
        </div>
    );
}

export default function AppDetailsPage() {
    const params = useParams();
    const { id } = params;
    const [app, setApp] = useState<AppDetails | null>(null);
    const [loading, setLoading] = useState(true);
    const [dateRange, setDateRange] = useState('30d');

    useEffect(() => {
        setLoading(true);
        const endDate = new Date();
        let startDate = new Date();

        if (dateRange === '7d') {
            startDate.setDate(endDate.getDate() - 7);
        } else if (dateRange === '30d') {
            startDate.setDate(endDate.getDate() - 30);
        } else if (dateRange === '90d') {
            startDate.setDate(endDate.getDate() - 90);
        } else {
            // All time - set a very old date
            startDate = new Date(0);
        }

        const queryParams = new URLSearchParams({
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString(),
        });

        fetch(`/api/apps/${id}?${queryParams}`)
            .then((res) => res.json())
            .then((data) => {
                setApp(data);
                setLoading(false);
            });
    }, [id, dateRange]);

    if (loading) return (
        <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
    );
    if (!app) return <div className="p-8 text-center">App not found</div>;

    // Calculate stats
    const totalVisits = app.visits?.length || 0;

    const calculateStats = (key: keyof Visit) => {
        return app.visits.reduce((acc: any, visit: Visit) => {
            let value = visit[key];

            if (!value) {
                if (key === 'referrer') {
                    value = 'Direct / Unknown';
                } else if (key === 'country' || key === 'city') {
                    value = 'Unknown Location';
                } else {
                    value = 'N/A';
                }
            }

            acc[value] = (acc[value] || 0) + 1;
            return acc;
        }, {});
    };

    const deviceStats = calculateStats('deviceType');
    const referrerStats = calculateStats('referrer');
    const countryStats = calculateStats('country');
    const cityStats = calculateStats('city');
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

            <div className="flex justify-end">
                <div className="inline-flex bg-gray-100 p-1 rounded-lg">
                    {[
                        { label: '7 Days', value: '7d' },
                        { label: '30 Days', value: '30d' },
                        { label: '90 Days', value: '90d' },
                        { label: 'All Time', value: 'all' },
                    ].map((range) => (
                        <button
                            key={range.value}
                            onClick={() => setDateRange(range.value)}
                            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${dateRange === range.value
                                ? 'bg-white text-gray-900 shadow-sm'
                                : 'text-gray-500 hover:text-gray-900'
                                }`}
                        >
                            {range.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {renderStatSection('Device Breakdown', Smartphone, deviceStats, 'bg-indigo-500')}
                {renderStatSection('Top Referrers', Globe, referrerStats, 'bg-green-500')}
                {renderStatSection('Top Countries', Globe, countryStats, 'bg-teal-500')}
                {renderStatSection('Top Cities', Globe, cityStats, 'bg-cyan-500')}
                {renderStatSection('UTM Sources', Layers, utmSourceStats, 'bg-purple-500')}
                {renderStatSection('UTM Mediums', Hash, utmMediumStats, 'bg-orange-500')}
                {renderStatSection('UTM Campaigns', Tag, utmCampaignStats, 'bg-pink-500')}
            </div>

            <div className="grid grid-cols-1 gap-6">
                <RealtimeWidget propertyId={app.ga4PropertyId} />
            </div>

            <CampaignManager appId={app.id} appSlug={app.slug} />
        </div>
    );
}
