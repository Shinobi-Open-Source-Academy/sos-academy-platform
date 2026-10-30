'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import {
  ALL_NAV_LINKS,
  NAV_LINKS,
  NAV_PLATFORM_LINKS,
  NAV_RESOURCE_LINKS,
  SITE_CONFIG,
} from '../lib/data';
import {
  ChevronDownIcon,
  GitHubIcon,
  NewspaperIcon,
  ShieldCheckIcon,
  UserGroupIcon,
} from './icons';

const HACKER_URL = process.env.NEXT_PUBLIC_HACKER_URL || 'http://localhost:3002';

interface NavDropdownLink {
  name: string;
  href: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  iconTint: string;
}

// Presentation metadata (icon, blurb, accent tint) for the nav dropdowns.
// Hrefs stay sourced from lib/data.ts so links have one place of truth.
const PLATFORM_META: Record<string, Omit<NavDropdownLink, 'name' | 'href'>> = {
  Mentors: {
    description: 'Meet our Senseis',
    icon: UserGroupIcon,
    iconTint: 'text-emerald-400',
  },
  Blog: {
    description: 'Stories & updates',
    icon: NewspaperIcon,
    iconTint: 'text-blue-400',
  },
  'Start Hacking': {
    description: 'Sign in with GitHub',
    icon: GitHubIcon,
    iconTint: 'text-purple-400',
  },
};

const RESOURCE_META: Record<string, Omit<NavDropdownLink, 'name' | 'href'>> = {
  'Privacy Policy': {
    description: 'How we handle your data',
    icon: ShieldCheckIcon,
    iconTint: 'text-teal-400',
  },
};

const PLATFORM_DROPDOWN_LINKS: NavDropdownLink[] = [
  ...NAV_PLATFORM_LINKS,
  { name: 'Start Hacking', href: `${HACKER_URL}/login` },
].map((link) => ({ ...link, ...PLATFORM_META[link.name] }));

const RESOURCE_DROPDOWN_LINKS: NavDropdownLink[] = NAV_RESOURCE_LINKS.map((link) => ({
  ...link,
  ...RESOURCE_META[link.name],
}));

interface NavDropdownProps {
  label: string;
  links: NavDropdownLink[];
}

function NavDropdown({ label, links }: NavDropdownProps) {
  const [open, setOpen] = useState(false);

  return (
    <div
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-white transition-colors py-2"
        aria-expanded={open}
      >
        {label}
        <ChevronDownIcon
          className={`w-3.5 h-3.5 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>
      <div
        className={`absolute top-full right-0 pt-2 transition-all duration-150 ${
          open ? 'opacity-100 translate-y-0 visible' : 'opacity-0 -translate-y-1 invisible'
        }`}
      >
        <div className="w-80 rounded-xl border border-white/10 bg-black/95 backdrop-blur-xl shadow-2xl shadow-black/60 overflow-hidden">
          <div className="px-4 pt-3 pb-1">
            <p className="text-[10px] font-semibold tracking-widest text-gray-500 uppercase">
              {label}
            </p>
          </div>
          <div className="py-1">
            {links.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={() => setOpen(false)}
                className="group relative flex items-center overflow-hidden px-4 py-3.5 transition-colors hover:bg-white/[0.05]"
              >
                <link.icon
                  className={`pointer-events-none absolute -right-3 top-1/2 h-14 w-14 -translate-y-1/2 opacity-[0.08] transition-opacity duration-200 group-hover:opacity-[0.16] ${link.iconTint}`}
                />
                <div className="relative min-w-0">
                  <p className="text-sm font-medium text-white">{link.name}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{link.description}</p>
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  const handleNavClick = () => {
    setMobileMenuOpen(false);
  };

  const handleJoinClick = () => {
    setMobileMenuOpen(false);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('openJoinModal'));
    }
  };

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-300 ${
          scrolled || mobileMenuOpen ? 'bg-black/95 backdrop-blur-lg' : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2 z-[110]">
              <img
                src="/shinobiLogo.png"
                alt="SOS Academy"
                className="h-[70px] w-[70px] object-contain"
              />
              {/* <span className="text-base font-semibold text-white">{SITE_CONFIG.name}</span> */}
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-6">
              {NAV_LINKS.map((link) => (
                <a
                  key={link.name}
                  href={link.href.startsWith('#') ? `/${link.href}` : link.href}
                  className="text-sm text-gray-400 hover:text-white transition-colors"
                >
                  {link.name}
                </a>
              ))}

              <div className="flex items-center gap-6">
                <NavDropdown label="Platforms" links={PLATFORM_DROPDOWN_LINKS} />
                <NavDropdown label="Resources" links={RESOURCE_DROPDOWN_LINKS} />
              </div>

              <button
                onClick={handleJoinClick}
                className="px-4 py-2 text-sm bg-white text-black hover:bg-gray-200 transition-colors"
                type="button"
              >
                Join Academy
              </button>
            </div>

            {/* Mobile Hamburger Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden relative z-[110] w-10 h-10 flex items-center justify-center focus:outline-none"
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileMenuOpen}
            >
              <div className="relative w-6 h-5 flex flex-col justify-center items-center">
                {/* Top line */}
                <span
                  className={`absolute h-[2px] w-6 bg-white rounded-full transform transition-all duration-300 ease-out ${
                    mobileMenuOpen ? 'rotate-45 translate-y-0' : '-translate-y-2'
                  }`}
                />
                {/* Middle line */}
                <span
                  className={`absolute h-[2px] w-6 bg-white rounded-full transition-all duration-200 ${
                    mobileMenuOpen ? 'opacity-0 scale-0' : 'opacity-100 scale-100'
                  }`}
                />
                {/* Bottom line */}
                <span
                  className={`absolute h-[2px] w-6 bg-white rounded-full transform transition-all duration-300 ease-out ${
                    mobileMenuOpen ? '-rotate-45 translate-y-0' : 'translate-y-2'
                  }`}
                />
              </div>
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <div
        className={`fixed inset-0 z-[99] md:hidden transition-all duration-500 ${
          mobileMenuOpen ? 'visible' : 'invisible'
        }`}
      >
        {/* Menu Panel - Full width, transparent */}
        <div
          className={`absolute inset-0 bg-black/85 backdrop-blur-xl transition-opacity duration-500 ease-out ${
            mobileMenuOpen ? 'opacity-100' : 'opacity-0'
          }`}
        >
          {/* Decorative gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60" />

          <div className="relative h-full flex flex-col pt-20 px-6">
            {/* Nav Links - Centered */}
            <nav className="flex flex-col items-center justify-center flex-1 gap-1">
              {ALL_NAV_LINKS.map((link, index) => (
                <a
                  key={link.name}
                  href={link.href.startsWith('#') ? `/${link.href}` : link.href}
                  onClick={handleNavClick}
                  className={`group relative py-3 text-lg font-light text-gray-300 hover:text-white transition-all duration-300 transform ${
                    mobileMenuOpen ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
                  }`}
                  style={{
                    transitionDelay: mobileMenuOpen ? `${100 + index * 60}ms` : '0ms',
                  }}
                >
                  <span className="relative z-10">{link.name}</span>
                  <span className="absolute left-1/2 -translate-x-1/2 bottom-2 w-0 h-[1px] bg-white/50 group-hover:w-full transition-all duration-300" />
                </a>
              ))}
            </nav>

            {/* Bottom section with button and tagline */}
            <div className="pb-10 px-2">
              {/* Tagline */}
              <div
                className={`mb-6 transform transition-all duration-500 ${
                  mobileMenuOpen ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
                }`}
                style={{
                  transitionDelay: mobileMenuOpen
                    ? `${100 + ALL_NAV_LINKS.length * 60 + 50}ms`
                    : '0ms',
                }}
              >
                <p className="text-xs text-gray-500 text-center">{SITE_CONFIG.tagline}</p>
              </div>

              {/* Buttons */}
              <div
                className={`space-y-3 transform transition-all duration-500 ${
                  mobileMenuOpen ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
                }`}
                style={{
                  transitionDelay: mobileMenuOpen
                    ? `${100 + ALL_NAV_LINKS.length * 60 + 100}ms`
                    : '0ms',
                }}
              >
                <a
                  href={`${HACKER_URL}/login`}
                  onClick={handleNavClick}
                  className="flex items-center justify-center gap-2 w-full py-3.5 text-sm font-medium text-white border border-white/20 hover:bg-white/5 transition-colors"
                >
                  <GitHubIcon className="w-5 h-5" />
                  <span>Start Hacking</span>
                </a>
                <button
                  onClick={handleJoinClick}
                  className="w-full py-3.5 text-sm font-medium bg-white text-black hover:bg-gray-100 transition-colors"
                  type="button"
                >
                  Join Academy
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
