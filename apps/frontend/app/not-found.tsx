import Footer from '@/app/components/Footer';
import Navbar from '@/app/components/Navbar';
import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <Navbar />

      <div className="min-h-[80vh] flex items-center justify-center px-6">
        <div className="max-w-xl text-center">
          <h1 className="text-6xl md:text-8xl font-bold text-white mb-4">404</h1>
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">Page Not Found</h2>
          <p className="text-gray-300 mb-8">
            The page you&apos;re looking for doesn&apos;t exist or may have been moved.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/"
              className="bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-lg font-medium transition-all duration-300"
            >
              Back to Home
            </Link>
            <Link
              href="/#communities"
              className="border border-gray-700 hover:border-gray-500 text-gray-300 hover:text-white px-6 py-3 rounded-lg font-medium transition-all duration-300"
            >
              Browse Communities
            </Link>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
