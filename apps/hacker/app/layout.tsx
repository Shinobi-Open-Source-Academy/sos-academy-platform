import type { Metadata } from 'next';
import './global.css';

export const metadata: Metadata = {
  title: {
    default: 'Hacker Portal - SOS Academy',
    template: '%s | SOS Academy',
  },
  description: 'Member portal for Shinobi Open-Source Academy hackers',
  icons: {
    icon: '/shinobiLogo.png',
  },
};

export const dynamic = 'force-dynamic';

import { AuthProvider } from './providers/AuthProvider';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased text-slate-50 bg-slate-950">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
