import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-gray-900 to-black text-white p-4">
      <div className="max-w-2xl text-center space-y-8">
        <h1 className="text-5xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600">
          App Link Manager
        </h1>
        <p className="text-xl text-gray-400">
          Create smart links for your mobile apps. One link for all platforms.
          Automatic redirection to App Store or Google Play based on device.
        </p>

        <div className="flex justify-center gap-4 pt-4">
          <Link
            href="/admin"
            className="px-8 py-4 bg-white text-black rounded-full font-bold hover:bg-gray-200 transition-all transform hover:scale-105"
          >
            Go to Admin Dashboard
          </Link>
        </div>
      </div>

      <footer className="absolute bottom-8 text-gray-600 text-sm">
        Powered by Next.js & Prisma
      </footer>
    </div>
  );
}
