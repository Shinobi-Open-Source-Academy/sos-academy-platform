'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import SubscriptionModal from './SubscriptionModal';
import CloseIcon from './icons/CloseIcon';
import MenuIcon from './icons/MenuIcon';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeLink, setActiveLink] = useState('');
  const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState(false);

  useEffect(() => {
    setIsLoaded(true);

    const handleScroll = () => {
      // Update scrolled state
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }

      // Update active link based on scroll position (only on home page)
      if (window.location.pathname === '/') {
        const sections = ['about', 'communities', 'projects', 'mentors'];
        const scrollPosition = window.scrollY + 50;

        for (const section of sections) {
          const element = document.getElementById(section);
          if (
            element &&
            scrollPosition >= element.offsetTop &&
            scrollPosition < element.offsetTop + element.offsetHeight
          ) {
            setActiveLink(section);
            break;
          }
        }
      } else {
        // For other pages, set active link based on current path
        const currentPath = window.location.pathname;
        if (currentPath === '/documentation') {
          setActiveLink('documentation');
        } else if (currentPath === '/blog') {
          setActiveLink('blog');
        } else if (currentPath === '/privacy-policy') {
          setActiveLink('privacy-policy');
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Set active link immediately on page load for non-home pages
  useEffect(() => {
    if (window.location.pathname !== '/') {
      const currentPath = window.location.pathname;
      if (currentPath === '/documentation') {
        setActiveLink('documentation');
      } else if (currentPath === '/blog') {
        setActiveLink('blog');
      } else if (currentPath === '/privacy-policy') {
        setActiveLink('privacy-policy');
      }
    }
  }, []);

  const links = [
    { href: '/#about', label: 'About' },
    { href: '/#communities', label: 'Communities' },
    { href: '/#projects', label: 'Projects' },
    { href: '/#mentors', label: 'Mentors' },
    { href: '/documentation', label: 'Docs' },
    { href: '/blog', label: 'Blog' },
  ];

  return (
    <header
      className={`py-4 fixed w-full top-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-gray-900/90 backdrop-blur-sm border-b border-gray-800/60 shadow-lg shadow-black/10'
          : 'bg-gray-900'
      }`}
    >
      <div className="container mx-auto px-6 flex justify-between items-center">
        <Link href="/" className="flex items-center gap-3 group" onClick={() => setActiveLink('')}>
          <div
            className="relative transform transition-all duration-500 ease-out group-hover:scale-110"
            style={{
              opacity: isLoaded ? 1 : 0,
              transform: `translateY(${isLoaded ? '0' : '10px'})`,
              transition: 'opacity 0.5s ease-out, transform 0.5s ease-out',
            }}
          >
            <Image
              src="/shinobiLogo.png"
              alt="Shinobi Open-Source Academy"
              width={40}
              height={40}
              className="drop-shadow-[0_0_12px_rgba(255,255,255,0.35)]"
              style={{ width: 'auto', height: 'auto' }}
            />
            <div className="absolute -inset-1 bg-primary/20 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </div>
          <span className="text-xl font-bold text-white tracking-tight">SOS Academy</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`relative text-base px-1 py-1 ${
                activeLink === link.href.split('#')[1] || activeLink === link.href.split('/')[1]
                  ? 'text-white'
                  : 'text-gray-300 hover:text-transparent hover:bg-gradient-to-r hover:from-primary hover:to-gray-200 hover:bg-clip-text'
              } transition-colors duration-200`}
              onClick={() => setActiveLink(link.href.split('#')[1] || link.href.split('/')[1])}
            >
              {link.label}
              <span
                className={`absolute left-0 bottom-0 w-full h-0.5 bg-primary transform scale-x-0 origin-left transition-transform duration-300 ${
                  activeLink === link.href.split('#')[1] || activeLink === link.href.split('/')[1]
                    ? 'scale-x-100'
                    : ''
                }`}
              />
            </Link>
          ))}
        </nav>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-white p-2 rounded-lg hover:bg-white/10 transition-colors"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
        >
          {isMenuOpen ? <CloseIcon /> : <MenuIcon />}
        </button>
      </div>

      {/* Mobile Navigation */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
          isMenuOpen ? 'max-h-[400px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="px-6 py-6 space-y-4 bg-gray-900/95 backdrop-blur-md border-t border-gray-800/60">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`block text-base py-1 ${
                activeLink === link.href.split('#')[1] || activeLink === link.href.split('/')[1]
                  ? 'text-white font-medium'
                  : 'text-gray-300'
              } hover:text-white transition-colors`}
              onClick={() => {
                setActiveLink(link.href.split('#')[1] || link.href.split('/')[1]);
                setIsMenuOpen(false);
              }}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Subscription Modal */}
      <SubscriptionModal
        isOpen={isSubscriptionModalOpen}
        onClose={() => setIsSubscriptionModalOpen(false)}
      />
    </header>
  );
}
