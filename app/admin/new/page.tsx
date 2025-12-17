'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function NewApp() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        slug: '',
        logoUrl: '',
        androidUrl: '',
        iosUrl: '',
        fallbackUrl: '',
        ogTitle: '',
        ogDescription: '',
        ogImage: '',
        ga4PropertyId: '',
    });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch('/api/apps', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (res.ok) {
                router.push('/admin');
            } else {
                const errorData = await res.json();
                alert(`Failed to create app: ${errorData.error || 'Unknown error'}`);
            }
        } catch (error) {
            alert('Error creating app: ' + (error instanceof Error ? error.message : String(error)));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Create New App Link</h2>

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
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description (Optional)</label>
                    <textarea
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black h-24"
                        placeholder="Enter a brief description of your app..."
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    />
                </div>

                {/* New Logo URL input field */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Logo URL (Optional)</label>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                            placeholder="https://example.com/logo.png or /uploads/..."
                            value={formData.logoUrl}
                            onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
                        />
                        <label className="cursor-pointer bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg border border-gray-300 transition-colors flex items-center gap-2">
                            <span>Upload</span>
                            <input
                                type="file"
                                className="hidden"
                                accept="image/*"
                                onChange={async (e) => {
                                    const file = e.target.files?.[0];
                                    if (!file) return;

                                    const data = new FormData();
                                    data.append('file', file);

                                    try {
                                        const res = await fetch('/api/upload', {
                                            method: 'POST',
                                            body: data,
                                        });
                                        const json = await res.json();
                                        if (json.url) {
                                            setFormData({ ...formData, logoUrl: json.url });
                                        } else {
                                            alert('Upload failed');
                                        }
                                    } catch (err) {
                                        console.error(err);
                                        alert('Upload error');
                                    }
                                }}
                            />
                        </label>
                    </div>
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

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Google Analytics 4 Property ID (Optional)</label>
                    <input
                        type="text"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                        placeholder="123456789"
                        value={formData.ga4PropertyId}
                        onChange={(e) => setFormData({ ...formData, ga4PropertyId: e.target.value })}
                    />
                    <p className="text-xs text-gray-500 mt-1">If provided, real-time analytics for this specific property will be shown in the dashboard.</p>
                </div>

                <div className="border-t border-gray-200 pt-6 mt-6">
                    <h3 className="text-lg font-bold text-gray-800 mb-4">Social Media Preview (OG Tags)</h3>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Social Title</label>
                            <input
                                type="text"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                                placeholder="Title shown on WhatsApp/Twitter"
                                value={formData.ogTitle}
                                onChange={(e) => setFormData({ ...formData, ogTitle: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Social Description</label>
                            <textarea
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black h-20"
                                placeholder="Description shown on social media..."
                                value={formData.ogDescription}
                                onChange={(e) => setFormData({ ...formData, ogDescription: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Social Image URL</label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                                    placeholder="https://example.com/social-image.png"
                                    value={formData.ogImage}
                                    onChange={(e) => setFormData({ ...formData, ogImage: e.target.value })}
                                />
                                <label className="cursor-pointer bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg border border-gray-300 transition-colors flex items-center gap-2">
                                    <span>Upload</span>
                                    <input
                                        type="file"
                                        className="hidden"
                                        accept="image/*"
                                        onChange={async (e) => {
                                            const file = e.target.files?.[0];
                                            if (!file) return;

                                            const data = new FormData();
                                            data.append('file', file);

                                            try {
                                                const res = await fetch('/api/upload', {
                                                    method: 'POST',
                                                    body: data,
                                                });
                                                const json = await res.json();
                                                if (json.url) {
                                                    setFormData({ ...formData, ogImage: json.url });
                                                } else {
                                                    alert('Upload failed');
                                                }
                                            } catch (err) {
                                                console.error(err);
                                                alert('Upload error');
                                            }
                                        }}
                                    />
                                </label>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="pt-4">
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
                    >
                        {loading ? 'Creating...' : 'Create Link'}
                    </button>
                </div>
            </form>
        </div>
    );
}
