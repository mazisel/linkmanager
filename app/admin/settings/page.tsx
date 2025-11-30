'use client';

import { useState, useEffect } from 'react';

export default function SettingsPage() {
    const [formData, setFormData] = useState({
        siteTitle: '',
        siteDescription: '',
        showAdminLink: false,
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetch('/api/settings')
            .then((res) => res.json())
            .then((data) => {
                setFormData({
                    siteTitle: data.siteTitle || 'App Showcase',
                    siteDescription: data.siteDescription || 'Discover our latest mobile applications. Download directly for your device.',
                    showAdminLink: data.showAdminLink || false,
                });
                setLoading(false);
            })
            .catch((err) => {
                console.error('Error fetching settings:', err);
                setLoading(false);
            });
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            const res = await fetch('/api/settings', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (res.ok) {
                alert('Settings saved successfully!');
            } else {
                alert('Failed to save settings');
            }
        } catch (error) {
            console.error('Error saving settings:', error);
            alert('Error saving settings');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div className="max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-800 mb-8">Showcase Settings</h2>

            <form onSubmit={handleSubmit} className="space-y-6 bg-white p-8 rounded-xl shadow-sm border border-gray-200">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Site Title</label>
                    <input
                        type="text"
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                        value={formData.siteTitle}
                        onChange={(e) => setFormData({ ...formData, siteTitle: e.target.value })}
                    />
                    <p className="mt-1 text-sm text-gray-500">The main title displayed on the showcase page.</p>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Site Description</label>
                    <textarea
                        required
                        rows={3}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                        value={formData.siteDescription}
                        onChange={(e) => setFormData({ ...formData, siteDescription: e.target.value })}
                    />
                    <p className="mt-1 text-sm text-gray-500">The subtitle/description displayed below the title.</p>
                </div>

                <div className="flex items-center justify-between py-4 border-t border-gray-100">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Show Admin Link</label>
                        <p className="text-sm text-gray-500">Display "Admin Login" link in the showcase header.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input
                            type="checkbox"
                            className="sr-only peer"
                            checked={formData.showAdminLink}
                            onChange={(e) => setFormData({ ...formData, showAdminLink: e.target.checked })}
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                </div>

                <div className="pt-4">
                    <button
                        type="submit"
                        disabled={saving}
                        className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
                    >
                        {saving ? 'Saving...' : 'Save Settings'}
                    </button>
                </div>
            </form>
        </div>
    );
}
