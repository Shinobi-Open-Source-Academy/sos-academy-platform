import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-4 relative overflow-hidden">
      {/* Subtle grid background */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                           linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
        }}
      />

      {/* Gradient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-white/[0.02] rounded-full blur-3xl" />

      <div className="relative z-10 text-center max-w-md">
        {/* 404 with glitch effect styling */}
        <div className="relative mb-6">
          <h1 className="text-[150px] sm:text-[180px] font-black leading-none tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-600 select-none">
            404
          </h1>
          <div className="absolute inset-0 text-[150px] sm:text-[180px] font-black leading-none tracking-tighter text-white/[0.03] blur-xl select-none">
            404
          </div>
        </div>

        {/* Message */}
        <h2 className="text-xl sm:text-2xl font-light text-gray-300 mb-3">Lost in the shadows</h2>
        <p className="text-sm text-gray-500 mb-10 max-w-xs mx-auto">
          This path leads nowhere. Even the best shinobi sometimes wander off course.
        </p>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="px-6 py-3 bg-white text-black text-sm font-medium hover:bg-gray-100 transition-colors"
          >
            Return Home
          </Link>
          <Link
            href="/#communities"
            className="px-6 py-3 border border-white/20 text-white text-sm font-medium hover:bg-white/5 transition-colors"
          >
            Explore Communities
          </Link>
        </div>
      </div>

      {/* Bottom decoration */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
        <div className="flex items-center gap-2 text-gray-600 text-xs">
          <span className="w-8 h-[1px] bg-gray-800" />
          <span>SOS Academy</span>
          <span className="w-8 h-[1px] bg-gray-800" />
        </div>
      </div>
    </div>
  );
}
