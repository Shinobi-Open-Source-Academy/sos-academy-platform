import type { Metadata } from 'next';
import './global.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://shinobiopensource.academy'),
  title: {
    default: 'SOS Academy - Shinobi Open-Source Academy',
    template: '%s | SOS Academy',
  },
  description:
    'Learn through practical, collaborative open-source experience. Gain real-world skills and build your portfolio while working on meaningful projects with experienced mentors. Join our JavaScript, Python, Go, Java, and Ruby communities.',
  keywords: [
    'open source',
    'academy',
    'coding',
    'mentorship',
    'javascript',
    'python',
    'go',
    'java',
    'ruby',
    'programming',
    'learning',
    'community',
    'developers',
  ],
  authors: [{ name: 'SOS Academy', url: 'https://shinobiopensource.academy' }],
  creator: 'SOS Academy',
  publisher: 'SOS Academy',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://shinobiopensource.academy',
    title: 'SOS Academy - Empowering the Next Generation of Open-Source Warriors',
    description:
      'Learn through practical, collaborative open-source experience. Join communities in JavaScript, Python, Go, Java, and Ruby. Work on real projects with experienced mentors.',
    siteName: 'Shinobi Open-Source Academy',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'SOS Academy - Open Source Learning Platform',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SOS Academy - Empowering the Next Generation of Open-Source Warriors',
    description:
      'Learn through practical, collaborative open-source experience. Join our developer communities and work on real projects.',
    creator: '@SOSAcademy_',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/shinobiLogo.png',
    shortcut: '/shinobiLogo.png',
    apple: '/shinobiLogo.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="canonical" href="https://shinobiopensource.academy" />
        <meta name="theme-color" content="#000000" />
      </head>
      <body>{children}</body>
    </html>
  );
}
