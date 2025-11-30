'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

interface Visit {
    id: string;
    deviceType: string;
    timestamp: string;
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
        // We need to fetch the app with visits. 
        // The current GET /api/apps/[id] doesn't include visits. 
        // We might need to update the API or fetch visits separately.
        // For simplicity, let's update the API to include visits count or just fetch all visits here if not too many.
        // Actually, let's just fetch the app and we might need a new endpoint for stats if we want to be efficient.
        // But for MVP, let's just update the GET /api/apps/[id] to include visits.

        fetch(`/api/apps/${id}`)
            .then((res) => res.json())
            .then((data) => {
                setApp(data);
                setLoading(false);
            });
    }, [id]);

    if (loading) return <div>Loading...</div>;
    if (!app) return <div>App not found</div>;

    // Calculate stats
    const totalVisits = app.visits?.length || 0;
    const deviceStats = app.visits?.reduce((acc: any, visit) => {
        acc[visit.deviceType] = (acc[visit.deviceType] || 0) + 1;
        return acc;
    }, {});

    return (
        <div>
            <h2 className="text-3xl font-bold text-gray-800 mb-6">{app.name} Analytics</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <h3 className="text-gray-500 text-sm font-medium uppercase">Total Clicks</h3>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{totalVisits}</p>
                </div>

                {/* Add more summary cards if needed */}
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-8">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Device Breakdown</h3>
                <div className="space-y-4">
                    {deviceStats && Object.entries(deviceStats).map(([device, count]: [string, any]) => (
                        <div key={device}>
                            <div className="flex justify-between text-sm mb-1">
                                <span className="font-medium text-gray-700">{device}</span>
                                <span className="text-gray-500">{count} ({Math.round((count / totalVisits) * 100)}%)</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2.5">
                                <div
                                    className="bg-blue-600 h-2.5 rounded-full"
                                    style={{ width: `${(count / totalVisits) * 100}%` }}
                                ></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
