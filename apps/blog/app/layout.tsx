import type { Metadata } from 'next';
import './global.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://blog.shinobi-open-source.academy'),
  title: {
    default: 'Blog — SOS Academy',
    template: '%s | SOS Academy Blog',
  },
  description: 'Insights, tutorials, and stories from the Shinobi Open-Source Academy community.',
  keywords: [
    'open source',
    'programming',
    'tutorials',
    'shinobi academy',
    'software engineering',
    'mentorship',
  ],
  openGraph: {
    siteName: 'SOS Academy Blog',
    type: 'website',
  },
  icons: {
    icon: '/shinobiLogo.png',
    shortcut: '/shinobiLogo.png',
    apple: '/shinobiLogo.png',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body suppressHydrationWarning className="min-h-screen bg-black text-white">
        {children}
      </body>
    </html>
  );
}
