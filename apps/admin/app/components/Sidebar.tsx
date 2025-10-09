'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { logout } from '../../lib/auth';

const navigation = [
  { name: 'Dashboard', href: '/' },
  { name: 'Mentors', href: '/applications/mentors' },
  { name: 'Members', href: '/applications/members' },
  { name: 'Events', href: '/events', child: '/new' },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="w-64 bg-gray-800 border-r border-gray-700 flex flex-col">
      <div className="p-6 border-b border-gray-700">
        <div className="flex gap-4 flex-col">
          <div>
            <h1 className="text-lg font-bold text-white text-xl">SOS Academy</h1>
            <p className="text-xs text-gray-400">Admin Panel</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navigation.map((item) => {
          const isActive =
            pathname === item.href || (item?.child ? pathname === item.href + item?.child : false);
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`
                block px-4 py-3 rounded-lg transition-colors
                ${
                  isActive
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-400 hover:bg-gray-700 hover:text-white'
                }
              `}
            >
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-700">
        <button
          type="button"
          onClick={logout}
          className="w-full px-4 py-3 rounded-lg text-gray-400 hover:bg-gray-700 hover:text-white transition-colors text-left"
        >
          Logout
        </button>
      </div>
    </div>
  );
}
