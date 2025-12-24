'use client';

import { useEffect, useState } from 'react';
import { MousePointer, TrendingUp } from 'lucide-react';

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

export default function AnalyticsDashboard() {
    const [stats, setStats] = useState<DashboardStats | null>(null);
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

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold text-gray-800">Analytics Overview</h2>
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
            </div>

            <div className="grid grid-cols-1 gap-8">
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
            </div>
        </div>
    );
}
