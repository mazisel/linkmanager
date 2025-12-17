'use client';

import { useEffect, useState } from 'react';
import { Activity, MousePointer, TrendingUp, Smartphone, Globe } from 'lucide-react';
import Link from 'next/link';

interface DashboardStats {
    todayVisits: number;
    yesterdayVisits: number;
    topApps: {
        id: string;
        name: string;
        slug: string;
        clicks: number;
    }[];
    userApps: {
        id: string;
        name: string;
        ga4PropertyId: string | null;
    }[];
}

interface RealtimeData {
    appId: string;
    activeUsers: number;
    error?: string;
}

export default function AnalyticsDashboard() {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [realtimeData, setRealtimeData] = useState<RealtimeData[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Fetch static DB stats
        fetch('/api/analytics/dashboard')
            .then(res => res.json())
            .then(data => {
                setStats(data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, []);

    // Poll for realtime data
    useEffect(() => {
        if (!stats?.userApps?.length) return;

        const appIds = stats.userApps
            .filter(app => app.ga4PropertyId) // Only query apps with GA4 configured
            .map(app => app.id);

        if (appIds.length === 0) return;

        const fetchRealtime = () => {
            fetch('/api/analytics/batch-realtime', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ appIds })
            })
                .then(res => res.json())
                .then(data => {
                    if (Array.isArray(data)) {
                        setRealtimeData(data);
                    }
                })
                .catch(console.error);
        };

        fetchRealtime(); // Initial fetch
        const interval = setInterval(fetchRealtime, 30000); // Poll every 30s
        return () => clearInterval(interval);
    }, [stats]);

    if (loading) return (
        <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
    );

    if (!stats) return <div className="p-8 text-center text-red-500">Failed to load analytics</div>;

    // Calculate percent change
    const visitChange = stats.yesterdayVisits === 0
        ? stats.todayVisits > 0 ? 100 : 0
        : Math.round(((stats.todayVisits - stats.yesterdayVisits) / stats.yesterdayVisits) * 100);

    const totalActiveUsers = realtimeData.reduce((acc, curr) => acc + curr.activeUsers, 0);

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold text-gray-800">Analytics Overview</h2>
                <div className="text-sm text-gray-500">
                    Live updates active for GA4
                </div>
            </div>

            {/* Top Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Total Clicks Today */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                            <MousePointer size={24} />
                        </div>
                        {visitChange !== 0 && (
                            <span className={`text-xs font-bold px-2 py-1 rounded-full ${visitChange > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                {visitChange > 0 ? '+' : ''}{visitChange}% vs yesterday
                            </span>
                        )}
                    </div>
                    <div className="text-3xl font-bold text-gray-900 mb-1">{stats.todayVisits}</div>
                    <div className="text-sm text-gray-500">Total clicks today</div>
                </div>

                {/* Real-time Users */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-5">
                        <Activity size={100} />
                    </div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg animate-pulse">
                                <Activity size={24} />
                            </div>
                        </div>
                        <div className="text-3xl font-bold text-gray-900 mb-1">{totalActiveUsers}</div>
                        <div className="text-sm text-gray-500 flex items-center gap-2">
                            Active users right now
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Top Apps Leaderboard */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <div className="flex items-center gap-3 mb-6">
                        <TrendingUp className="text-gray-400" size={20} />
                        <h3 className="font-bold text-gray-800 text-lg">Top Apps (Last 30 Days)</h3>
                    </div>

                    <div className="space-y-4">
                        {stats.topApps.length === 0 ? (
                            <p className="text-gray-500 italic text-center py-4">No data available yet</p>
                        ) : (
                            stats.topApps.map((app, index) => (
                                <div key={app.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors border border-transparent hover:border-gray-100">
                                    <div className="flex items-center gap-4">
                                        <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center bg-gray-100 text-gray-600 font-bold text-xs rounded-full">
                                            {index + 1}
                                        </span>
                                        <div>
                                            <div className="font-medium text-gray-900">{app.name}</div>
                                            <div className="text-xs text-gray-500">/{app.slug}</div>
                                        </div>
                                    </div>
                                    <div className="font-bold text-gray-800">
                                        {app.clicks.toLocaleString()} <span className="text-gray-400 text-xs font-normal">clicks</span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Live Activity Board */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <div className="flex items-center gap-3 mb-6">
                        <Activity className="text-green-500" size={20} />
                        <h3 className="font-bold text-gray-800 text-lg">Live Activity</h3>
                    </div>

                    <div className="space-y-2">
                        {realtimeData.length === 0 ? (
                            <div className="text-center py-8">
                                <p className="text-gray-500">No active users or GA4 not configured.</p>
                                <Link href="/admin/new" className="text-blue-600 text-sm mt-2 hover:underline">
                                    Configure GA4 Property ID in App Settings
                                </Link>
                            </div>
                        ) : (
                            realtimeData
                                .sort((a, b) => b.activeUsers - a.activeUsers)
                                .map((item) => {
                                    const appName = stats.userApps.find(a => a.id === item.appId)?.name || 'Unknown App';
                                    return (
                                        <div key={item.appId} className="flex items-center justify-between p-3 rounded-lg border border-gray-100 bg-gray-50">
                                            <span className="font-medium text-gray-700">{appName}</span>
                                            <div className="flex items-center gap-2">
                                                <span className="text-lg font-bold text-green-600">{item.activeUsers}</span>
                                                <span className="text-xs text-gray-500 uppercase">Users</span>
                                            </div>
                                        </div>
                                    );
                                })
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
