'use client';

import Link from 'next/link';
import { signOut } from 'next-auth/react';

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen flex bg-gray-50">
            {/* Sidebar */}
            <aside className="w-64 bg-white border-r border-gray-200 fixed h-full">
                <div className="p-6">
                    <h1 className="text-xl font-bold text-gray-800">Link Manager</h1>
                </div>
                <nav className="px-4 space-y-2">
                    <Link
                        href="/admin"
                        className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        Dashboard
                    </Link>
                    <Link
                        href="/admin/new"
                        className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        New App Link
                    </Link>
                    <Link
                        href="/admin/settings"
                        className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        Settings
                    </Link>
                </nav>

                <div className="absolute bottom-0 w-full p-4 border-t border-gray-200">
                    <button
                        onClick={() => signOut({ callbackUrl: '/login' })}
                        className="w-full px-4 py-2 text-left text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-2"
                    >
                        <span>Logout</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 ml-64 p-8">
                {children}
            </main>
        </div>
    );
}
