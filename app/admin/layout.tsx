'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { LayoutDashboard, Plus, Settings, LogOut, PieChart } from 'lucide-react';

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();

    const isActive = (path: string) => pathname === path;

    const navItems = [
        { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
        { href: '/admin/analytics', label: 'Analytics', icon: PieChart },
        { href: '/admin/new', label: 'New Link', icon: Plus },
        { href: '/admin/settings', label: 'Settings', icon: Settings },
    ];

    return (
        <div className="min-h-screen flex bg-gray-50 pb-20 md:pb-0">
            {/* Desktop Sidebar */}
            <aside className="hidden md:block w-64 bg-white border-r border-gray-200 fixed h-full z-10">
                <div className="p-6">
                    <h1 className="text-xl font-bold text-gray-800">Link Manager</h1>
                </div>
                <nav className="px-4 space-y-2">
                    {navItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive(item.href)
                                ? 'bg-blue-50 text-blue-600 font-medium'
                                : 'text-gray-700 hover:bg-gray-100'
                                }`}
                        >
                            <item.icon size={20} />
                            {item.label}
                        </Link>
                    ))}
                </nav>

                <div className="absolute bottom-0 w-full p-4 border-t border-gray-200">
                    <button
                        onClick={() => signOut({ callbackUrl: '/login' })}
                        className="w-full px-4 py-2 text-left text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-2"
                    >
                        <LogOut size={20} />
                        <span>Logout</span>
                    </button>
                </div>
            </aside>

            {/* Mobile Bottom Navigation */}
            <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 px-6 py-3 flex justify-between items-center safe-area-bottom">
                {navItems.map((item) => (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={`flex flex-col items-center gap-1 ${isActive(item.href) ? 'text-blue-600' : 'text-gray-500'
                            }`}
                    >
                        <item.icon size={24} />
                        <span className="text-[10px] font-medium">{item.label}</span>
                    </Link>
                ))}
                <button
                    onClick={() => signOut({ callbackUrl: '/login' })}
                    className="flex flex-col items-center gap-1 text-gray-500"
                >
                    <LogOut size={24} />
                    <span className="text-[10px] font-medium">Logout</span>
                </button>
            </nav>

            {/* Main Content */}
            <main className="flex-1 md:ml-64 p-4 md:p-8 w-full max-w-full overflow-x-hidden">
                {children}
            </main>
        </div>
    );
}
