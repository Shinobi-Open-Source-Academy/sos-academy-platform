import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-6xl font-bold mb-4">404</h1>
        <h2 className="text-2xl font-semibold mb-4">Community Not Found</h2>
        <p className="text-gray-400 mb-8">The community you're looking for doesn't exist.</p>
        <Link
          href="/#communities"
          className="inline-block px-6 py-3 bg-white text-black hover:bg-gray-200 transition-colors text-sm font-medium"
        >
          View All Communities
        </Link>
      </div>
    </div>
  );
}
