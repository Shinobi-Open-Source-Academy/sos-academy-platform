'use client';

import Link from 'next/link';

interface HeroButtonProps {
  text: string;
  href: string;
  isPrimary?: boolean;
  className?: string;
  icon?: React.ReactNode;
}

export default function HeroButton({
  text,
  href,
  isPrimary = false,
  className = '',
  icon,
}: HeroButtonProps) {
  if (isPrimary) {
    return (
      <Link
        href={href}
        className={`relative overflow-hidden px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-sans font-semibold text-sm sm:text-base text-white bg-primary transition-all duration-300 ease-in-out transform group hover:scale-105 hover:shadow-xl ${className}`}
      >
        <span className="relative z-10 flex items-center gap-1 sm:gap-2">
          {text}
          {icon}
        </span>
        <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-in-out blur-sm z-0" />
      </Link>
    );
  }

  return (
    <Link
      href={href}
      className={`relative px-4 sm:px-6 py-2.5 sm:py-3 text-white border border-white/20 rounded-lg font-sans font-semibold text-sm sm:text-base overflow-hidden group transition-all duration-300 ease-in-out ${className}`}
    >
      <span className="relative z-10 group-hover:text-primary transition-colors duration-300">
        {text}
      </span>
      <span className="absolute inset-0 bg-white/10 blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-0" />
    </Link>
  );
}
