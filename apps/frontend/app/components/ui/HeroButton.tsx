"use client";

import Link from "next/link";

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
  className = "",
  icon
}: HeroButtonProps) {
  const buttonGlow =
    "after:absolute after:inset-0 after:rounded-lg after:opacity-0 after:transition-opacity hover:after:opacity-100 after:bg-primary after:blur-xl after:-z-10 relative";

  if (isPrimary) {
    return (
      <Link
        href={href}
        className={`bg-primary hover:bg-primary/90 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-sans font-semibold text-sm sm:text-base transition-all transform hover:scale-105 hover:shadow-glow z-10 group ${buttonGlow} ${className}`}
      >
        <span className="relative z-10 flex items-center gap-1 sm:gap-2">
          {text}
          {icon}
        </span>
      </Link>
    );
  }

  return (
    <Link
      href={href}
      className={`px-4 sm:px-6 py-2.5 sm:py-3 border border-gray-300/30 text-white rounded-lg font-sans font-semibold text-sm sm:text-base hover:bg-white/10 transition-all transform hover:scale-105 relative group overflow-hidden ${className}`}
    >
      <span className="relative z-10">{text}</span>
      <span className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/20 to-primary/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></span>
    </Link>
  );
} 