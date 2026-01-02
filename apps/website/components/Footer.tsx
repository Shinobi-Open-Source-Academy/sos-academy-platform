import Link from 'next/link';
import { SITE_CONFIG, NAV_LINKS } from '../lib/data';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-white/5 bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <img src="/shinobiLogo.png" alt="SOS Academy" className="h-10 w-10" />
              <span className="text-lg font-semibold text-white">{SITE_CONFIG.fullName}</span>
            </div>
            <p className="text-gray-400 text-sm mb-4 max-w-md">{SITE_CONFIG.tagline}</p>
            <div className="flex items-center gap-4">
              <a
                href={SITE_CONFIG.urls.github}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors"
              >
                GitHub
              </a>
              <a
                href={SITE_CONFIG.urls.twitter}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors"
              >
                Twitter
              </a>
              <a
                href={SITE_CONFIG.urls.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors"
              >
                LinkedIn
              </a>
              <a
                href={SITE_CONFIG.urls.discord}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors"
              >
                Discord
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4 text-sm">Navigation</h3>
            <ul className="space-y-2">
              {NAV_LINKS.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-gray-400 hover:text-white text-sm transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4 text-sm">Contact</h3>
            <ul className="space-y-2">
              <li className="text-gray-400 text-sm">{SITE_CONFIG.email}</li>
              <li className="text-gray-400 text-sm">Weekly calls Thursday 7 PM UTC</li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-white/5">
          <p className="text-gray-500 text-sm text-center">
            © {currentYear} {SITE_CONFIG.fullName}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
