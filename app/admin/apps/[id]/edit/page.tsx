'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';

export default function EditApp({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    const { id } = use(params);
    const [formData, setFormData] = useState({
        name: '',
        slug: '',
        androidUrl: '',
        iosUrl: '',
        fallbackUrl: '',
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const fetchApp = async () => {
            try {
                const res = await fetch(`/api/apps/${id}`);
                if (!res.ok) throw new Error('Failed to fetch app');
                const data = await res.json();
                setFormData({
                    name: data.name,
                    slug: data.slug,
                    androidUrl: data.androidUrl || '',
                    iosUrl: data.iosUrl || '',
                    fallbackUrl: data.fallbackUrl || '',
                });
            } catch (error) {
                alert('Error loading app details');
                router.push('/admin');
            } finally {
                setLoading(false);
            }
        };

        fetchApp();
    }, [id, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            const res = await fetch(`/api/apps/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, ...formData }),
            });

            if (res.ok) {
                router.push('/admin');
            } else {
                const errorData = await res.json();
                alert(`Failed to update app: ${errorData.error || 'Unknown error'}`);
            }
        } catch (error) {
            alert('Error updating app: ' + (error instanceof Error ? error.message : String(error)));
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-8 text-center">Loading...</div>;

    return (
        <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Edit App Link</h2>

            <form onSubmit={handleSubmit} className="space-y-6 bg-white p-8 rounded-xl shadow-sm border border-gray-200">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">App Name</label>
                    <input
                        type="text"
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Slug (Short Link)</label>
                    <div className="flex">
                        <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                            /
                        </span>
                        <input
                            type="text"
                            required
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-r-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                            value={formData.slug}
                            onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Android URL (Google Play)</label>
                    <input
                        type="url"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                        placeholder="https://play.google.com/store/apps/details?id=..."
                        value={formData.androidUrl}
                        onChange={(e) => setFormData({ ...formData, androidUrl: e.target.value })}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">iOS URL (App Store)</label>
                    <input
                        type="url"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                        placeholder="https://apps.apple.com/app/..."
                        value={formData.iosUrl}
                        onChange={(e) => setFormData({ ...formData, iosUrl: e.target.value })}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Fallback URL (Optional)</label>
                    <input
                        type="url"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                        placeholder="https://yourwebsite.com"
                        value={formData.fallbackUrl}
                        onChange={(e) => setFormData({ ...formData, fallbackUrl: e.target.value })}
                    />
                </div>

                <div className="pt-4 flex gap-4">
                    <button
                        type="button"
                        onClick={() => router.push('/admin')}
                        className="w-full py-3 px-4 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={saving}
                        className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
                    >
                        {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </form>
        </div>
    );
}
