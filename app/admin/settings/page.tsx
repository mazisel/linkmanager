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

                <div className="pt-8 border-t border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Data Management</h3>
                    <div className="space-y-4">
                        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                            <h4 className="font-medium text-gray-700 mb-2">Export Data</h4>
                            <p className="text-sm text-gray-500 mb-4">Download a backup of all application data.</p>
                            <button
                                type="button"
                                onClick={async () => {
                                    try {
                                        const res = await fetch('/api/admin/data');
                                        if (!res.ok) throw new Error('Export failed');
                                        const blob = await res.blob();
                                        const url = window.URL.createObjectURL(blob);
                                        const a = document.createElement('a');
                                        a.href = url;
                                        a.download = `backup-${new Date().toISOString().split('T')[0]}.json`;
                                        document.body.appendChild(a);
                                        a.click();
                                        document.body.removeChild(a);
                                        window.URL.revokeObjectURL(url);
                                    } catch (err) {
                                        console.error(err);
                                        alert('Failed to export data');
                                    }
                                }}
                                className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 text-sm font-medium"
                            >
                                Export JSON
                            </button>
                        </div>

                        <div className="p-4 bg-red-50 rounded-lg border border-red-100">
                            <h4 className="font-medium text-red-800 mb-2">Import Data</h4>
                            <p className="text-sm text-red-600 mb-4">
                                ⚠️ This will <strong>DELETE ALL EXISTING DATA</strong> and replace it with the imported file. This action cannot be undone.
                            </p>
                            <div className="flex gap-4 items-center">
                                <input
                                    type="file"
                                    accept=".json"
                                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-red-100 file:text-red-700 hover:file:bg-red-200"
                                    onChange={async (e) => {
                                        const file = e.target.files?.[0];
                                        if (!file) return;

                                        if (!confirm('Are you absolutely sure? This will wipe the database and import this file.')) {
                                            e.target.value = '';
                                            return;
                                        }

                                        try {
                                            const text = await file.text();
                                            const json = JSON.parse(text);

                                            const res = await fetch('/api/admin/data', {
                                                method: 'POST',
                                                headers: { 'Content-Type': 'application/json' },
                                                body: JSON.stringify(json),
                                            });

                                            if (!res.ok) throw new Error('Import failed');

                                            alert('Data imported successfully! The page will refresh.');
                                            window.location.reload();
                                        } catch (err) {
                                            console.error(err);
                                            alert('Failed to import data: ' + (err as Error).message);
                                        }
                                        e.target.value = '';
                                    }}
                                />
                            </div>
                        </div>
                    </div>
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
