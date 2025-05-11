"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeLink, setActiveLink] = useState("");

  useEffect(() => {
    setIsLoaded(true);
    
    const handleScroll = () => {
      // Update scrolled state
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
      
      // Update active link based on scroll position
      const sections = ["about", "communities", "featured-projects", "mentors"];
      const scrollPosition = window.scrollY + 100;
      
      for (const section of sections) {
        const element = document.getElementById(section);
        if (element && 
            scrollPosition >= element.offsetTop && 
            scrollPosition < element.offsetTop + element.offsetHeight) {
          setActiveLink(section);
          break;
        }
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const links = [
    { href: "/#about", label: "About" },
    { href: "/#communities", label: "Communities" },
    { href: "/#featured-projects", label: "Projects" },
    { href: "/#mentors", label: "Mentors" }
  ];

  return (
    <header 
      className={`py-4 fixed w-full top-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-gray-900/90 backdrop-blur-sm border-b border-gray-800/60 shadow-lg shadow-black/10' 
          : 'bg-transparent'
      }`}>
      <div className="container mx-auto px-6 flex justify-between items-center">
        <Link 
          href="/" 
          className="flex items-center gap-3 group"
          onClick={() => setActiveLink("")}
        >
          <div 
            className="relative transform transition-all duration-500 ease-out group-hover:scale-110"
            style={{ 
              opacity: isLoaded ? 1 : 0, 
              transform: `translateY(${isLoaded ? '0' : '10px'})`, 
              transition: 'opacity 0.5s ease-out, transform 0.5s ease-out' 
            }}
          >
            <Image
              src="/shinobiLogo.png"
              alt="Shinobi Open-Source Academy"
              width={40}
              height={40}
              className="drop-shadow-[0_0_12px_rgba(255,255,255,0.35)]"
            />
            <div className="absolute -inset-1 bg-primary/20 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </div>
          <span className="text-xl font-bold text-white tracking-tight">SOSA</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`relative text-base px-1 py-1 ${
                activeLink === link.href.split("#")[1]
                  ? "text-white"
                  : "text-gray-300 hover:text-white"
              } transition-colors duration-200`}
              onClick={() => setActiveLink(link.href.split("#")[1])}
            >
              {link.label}
              <span 
                className={`absolute left-0 bottom-0 w-full h-0.5 bg-primary transform scale-x-0 origin-left transition-transform duration-300 ${
                  activeLink === link.href.split("#")[1] ? "scale-x-100" : ""
                }`}>
              </span>
            </Link>
          ))}
          <Link 
            href="/#join" 
            className="bg-primary hover:bg-primary/90 text-white px-6 py-2.5 rounded-lg font-medium transition-all duration-300 transform hover:translate-y-[-2px] hover:shadow-lg hover:shadow-primary/20 focus:ring-2 focus:ring-primary/50 focus:outline-none"
          >
            Join Us
          </Link>
        </nav>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-white p-2 rounded-lg hover:bg-white/10 transition-colors"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label={isMenuOpen ? "Close menu" : "Open menu"}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            {isMenuOpen ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile Navigation */}
      <div 
        className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
          isMenuOpen ? "max-h-[300px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="px-6 py-5 space-y-5 bg-gray-900/95 backdrop-blur-md border-t border-gray-800/60">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`block text-base py-1 ${
                activeLink === link.href.split("#")[1]
                  ? "text-white font-medium"
                  : "text-gray-300"
              } hover:text-white transition-colors`}
              onClick={() => {
                setActiveLink(link.href.split("#")[1]);
                setIsMenuOpen(false);
              }}
            >
              {link.label}
            </Link>
          ))}
          <Link 
            href="/#join" 
            className="inline-block bg-primary hover:bg-primary/90 text-white px-5 py-2.5 rounded-lg font-medium transition-all transform hover:translate-y-[-2px]"
            onClick={() => setIsMenuOpen(false)}
          >
            Join Us
          </Link>
        </div>
      </div>
    </header>
  );
}
