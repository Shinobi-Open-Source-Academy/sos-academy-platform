'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function Navbar({ websiteUrl }: { websiteUrl: string }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-300 ${
        scrolled ? 'bg-black/95 backdrop-blur-lg' : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/shinobiLogo.png"
              alt="SOS Academy"
              width={70}
              height={70}
              style={{ height: 'auto' }}
              className="object-contain"
            />
          </Link>
          <a href={websiteUrl} className="text-sm text-gray-400 hover:text-white transition-colors">
            ← Back to Academy
          </a>
        </div>
      </div>
    </nav>
  );
}
