import Link from 'next/link';
import { FOOTER_DATA } from '../../data/siteData';

export default function QuickLinks() {
  return (
    <div>
      <h4 className="text-lg font-bold mb-4">Quick Links</h4>
      <ul className="space-y-2">
        {FOOTER_DATA.quickLinks.map((link) => (
          <li key={`${link.href}-${link.label}`}>
            <Link href={link.href} className="text-gray-400 hover:text-white transition-colors">
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
