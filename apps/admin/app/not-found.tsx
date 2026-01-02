import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <div className="text-center max-w-md mx-4">
        <p className="text-[120px] font-semibold text-white/5 leading-none select-none">404</p>
        <div className="-mt-16 relative z-10">
          <h2 className="text-2xl font-semibold text-white mb-2">Page not found</h2>
          <p className="text-zinc-500 mb-8 text-sm">
            The page you are looking for does not exist or has been moved.
          </p>
          <Link href="/" className="btn-primary px-6">
            Return to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
