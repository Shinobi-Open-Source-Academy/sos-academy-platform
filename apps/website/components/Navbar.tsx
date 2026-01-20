'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { NAV_LINKS, SITE_CONFIG } from '../lib/data';
import { GitHubIcon } from './icons';

const HACKER_URL = process.env.NEXT_PUBLIC_HACKER_URL || 'http://localhost:3002';

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
              <div className="flex items-center gap-3">
                <a
                  href={`${HACKER_URL}/login`}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-gray-300 hover:text-white border border-white/10 hover:border-white/20 hover:bg-white/5 transition-all"
                  title="Start hacking with GitHub"
                >
                  <GitHubIcon className="w-4 h-4" />
                  <span>Hack</span>
                </a>
                <button
                  onClick={handleJoinClick}
                  className="px-4 py-2 text-sm bg-white text-black hover:bg-gray-200 transition-colors"
                  type="button"
                >
                  Join Academy
                </button>
              </div>
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
              {NAV_LINKS.map((link, index) => (
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
                  transitionDelay: mobileMenuOpen ? `${100 + NAV_LINKS.length * 60 + 50}ms` : '0ms',
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
                    ? `${100 + NAV_LINKS.length * 60 + 100}ms`
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
