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

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
