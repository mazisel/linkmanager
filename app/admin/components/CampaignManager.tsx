'use client';

import { useState, useEffect } from 'react';
import { Plus, Trash2, Copy, Check, Tag } from 'lucide-react';

interface Campaign {
    id: string;
    name: string;
    utmSource: string | null;
    utmMedium: string | null;
    utmCampaign: string | null;
    utmTerm: string | null;
    utmContent: string | null;
    createdAt: string;
}

interface CampaignManagerProps {
    appId: string;
    appSlug: string;
}

export default function CampaignManager({ appId, appSlug }: CampaignManagerProps) {
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);
    const [newCampaign, setNewCampaign] = useState({
        name: '',
        utmSource: '',
        utmMedium: '',
        utmCampaign: '',
        utmTerm: '',
        utmContent: '',
    });
    const [copiedId, setCopiedId] = useState<string | null>(null);

    useEffect(() => {
        fetchCampaigns();
    }, [appId]);

    const fetchCampaigns = async () => {
        try {
            const res = await fetch(`/api/campaigns?appId=${appId}`);
            if (res.ok) {
                const data = await res.json();
                setCampaigns(data);
            }
        } catch (error) {
            console.error('Failed to fetch campaigns', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch('/api/campaigns', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...newCampaign, appId }),
            });

            if (res.ok) {
                const campaign = await res.json();
                setCampaigns([campaign, ...campaigns]);
                setIsCreating(false);
                setNewCampaign({
                    name: '',
                    utmSource: '',
                    utmMedium: '',
                    utmCampaign: '',
                    utmTerm: '',
                    utmContent: '',
                });
            }
        } catch (error) {
            console.error('Failed to create campaign', error);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this campaign?')) return;

        try {
            const res = await fetch(`/api/campaigns/${id}`, {
                method: 'DELETE',
            });

            if (res.ok) {
                setCampaigns(campaigns.filter((c) => c.id !== id));
            }
        } catch (error) {
            console.error('Failed to delete campaign', error);
        }
    };

    const handleCopy = async (campaign: Campaign) => {
        const params = new URLSearchParams();
        if (campaign.utmSource) params.append('utm_source', campaign.utmSource);
        if (campaign.utmMedium) params.append('utm_medium', campaign.utmMedium);
        if (campaign.utmCampaign) params.append('utm_campaign', campaign.utmCampaign);
        if (campaign.utmTerm) params.append('utm_term', campaign.utmTerm);
        if (campaign.utmContent) params.append('utm_content', campaign.utmContent);

        const url = `${window.location.origin}/${appSlug}?${params.toString()}`;

        try {
            await navigator.clipboard.writeText(url);
            setCopiedId(campaign.id);
            setTimeout(() => setCopiedId(null), 2000);
        } catch (err) {
            console.error('Failed to copy', err);
            prompt('Copy this link:', url);
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                    <Tag size={20} className="text-blue-600" />
                    Campaigns & Tracking
                </h3>
                <button
                    onClick={() => setIsCreating(!isCreating)}
                    className="flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700"
                >
                    <Plus size={16} />
                    {isCreating ? 'Cancel' : 'New Campaign'}
                </button>
            </div>

            {isCreating && (
                <div className="p-6 bg-gray-50 border-b border-gray-200">
                    <form onSubmit={handleCreate} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Campaign Name (Internal)</label>
                            <input
                                type="text"
                                required
                                placeholder="e.g. Summer Sale Facebook"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                                value={newCampaign.name}
                                onChange={(e) => setNewCampaign({ ...newCampaign, name: e.target.value })}
                            />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Source (utm_source)</label>
                                <input
                                    type="text"
                                    placeholder="e.g. facebook, google"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                                    value={newCampaign.utmSource}
                                    onChange={(e) => setNewCampaign({ ...newCampaign, utmSource: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Medium (utm_medium)</label>
                                <input
                                    type="text"
                                    placeholder="e.g. cpc, banner"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                                    value={newCampaign.utmMedium}
                                    onChange={(e) => setNewCampaign({ ...newCampaign, utmMedium: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Campaign (utm_campaign)</label>
                                <input
                                    type="text"
                                    placeholder="e.g. summer_sale"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                                    value={newCampaign.utmCampaign}
                                    onChange={(e) => setNewCampaign({ ...newCampaign, utmCampaign: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Term (utm_term)</label>
                                <input
                                    type="text"
                                    placeholder="e.g. running shoes"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                                    value={newCampaign.utmTerm}
                                    onChange={(e) => setNewCampaign({ ...newCampaign, utmTerm: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="flex justify-end">
                            <button
                                type="submit"
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                            >
                                Create Campaign
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="divide-y divide-gray-200">
                {loading ? (
                    <div className="p-8 text-center text-gray-500">Loading campaigns...</div>
                ) : campaigns.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">
                        No campaigns created yet. Create one to track specific traffic sources.
                    </div>
                ) : (
                    campaigns.map((campaign) => (
                        <div key={campaign.id} className="p-4 hover:bg-gray-50 transition-colors">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div>
                                    <h4 className="font-medium text-gray-900">{campaign.name}</h4>
                                    <div className="flex flex-wrap gap-2 mt-1">
                                        {campaign.utmSource && (
                                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                                src: {campaign.utmSource}
                                            </span>
                                        )}
                                        {campaign.utmMedium && (
                                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                                                med: {campaign.utmMedium}
                                            </span>
                                        )}
                                        {campaign.utmCampaign && (
                                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
                                                cmp: {campaign.utmCampaign}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => handleCopy(campaign)}
                                        className={`p-2 rounded-lg transition-colors ${copiedId === campaign.id
                                            ? 'bg-green-100 text-green-700'
                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                            }`}
                                        title="Copy Link"
                                    >
                                        {copiedId === campaign.id ? <Check size={18} /> : <Copy size={18} />}
                                    </button>
                                    <button
                                        onClick={() => handleDelete(campaign.id)}
                                        className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                                        title="Delete Campaign"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
