import type { Metadata } from 'next';
import CodeBackground, { type FloatingItem } from '../../components/CodeBackground';
import Footer from '../../components/Footer';
import HeroGrid from '../../components/HeroGrid';
import Navbar from '../../components/Navbar';

export const metadata: Metadata = {
  title: 'Blog',
  description:
    'Stay updated with the latest insights, tutorials, and stories from the SOS Academy community.',
  openGraph: {
    title: 'Blog - SOS Academy',
    description: 'Latest insights, tutorials, and stories from our community.',
  },
};

const BLOG_SNIPPETS: FloatingItem[] = [
  {
    content: [
      { text: 'Building Scalable Systems', font: 'bold 16px Inter, sans-serif', color: '#fff' },
      { text: 'Learn how to leverage Rust for', font: '12px Inter, sans-serif', color: '#9ca3af' },
      {
        text: 'high-performance backend services.',
        font: '12px Inter, sans-serif',
        color: '#9ca3af',
      },
      { text: 'Jan 24 • 5 min read', font: '10px Inter, sans-serif', color: '#4ade80' },
    ],
  },
  {
    content: [
      { text: 'The Art of Open Source', font: 'bold 16px Inter, sans-serif', color: '#fff' },
      { text: 'Contributing to open source is', font: '12px Inter, sans-serif', color: '#9ca3af' },
      { text: 'more than just writing code.', font: '12px Inter, sans-serif', color: '#9ca3af' },
      { text: 'Feb 02 • 4 min read', font: '10px Inter, sans-serif', color: '#60a5fa' },
    ],
  },
  {
    content: [
      { text: 'Mastering Microservices', font: 'bold 16px Inter, sans-serif', color: '#fff' },
      { text: 'Breaking down monoliths into', font: '12px Inter, sans-serif', color: '#9ca3af' },
      { text: 'manageable, scalable services.', font: '12px Inter, sans-serif', color: '#9ca3af' },
      { text: 'Jan 28 • 8 min read', font: '10px Inter, sans-serif', color: '#f472b6' },
    ],
  },
  {
    content: [
      { text: 'Community First Design', font: 'bold 16px Inter, sans-serif', color: '#fff' },
      { text: 'How to build products that', font: '12px Inter, sans-serif', color: '#9ca3af' },
      { text: 'users actually love and need.', font: '12px Inter, sans-serif', color: '#9ca3af' },
      { text: 'Feb 10 • 6 min read', font: '10px Inter, sans-serif', color: '#a78bfa' },
    ],
  },
  {
    content: [
      { text: 'Zero to Hero in Golang', font: 'bold 16px Inter, sans-serif', color: '#fff' },
      { text: 'A comprehensive guide to', font: '12px Inter, sans-serif', color: '#9ca3af' },
      { text: 'mastering Go programming.', font: '12px Inter, sans-serif', color: '#9ca3af' },
      { text: 'Feb 15 • 12 min read', font: '10px Inter, sans-serif', color: '#2dd4bf' },
    ],
  },
  {
    content: [
      { text: 'System Design 101', font: 'bold 16px Inter, sans-serif', color: '#fff' },
      { text: 'Core concepts for building', font: '12px Inter, sans-serif', color: '#9ca3af' },
      { text: 'distributed systems.', font: '12px Inter, sans-serif', color: '#9ca3af' },
      { text: 'Feb 20 • 7 min read', font: '10px Inter, sans-serif', color: '#fbbf24' },
    ],
  },
];

export default function Blog() {
  return (
    <div className="flex flex-col min-h-screen bg-black text-white relative">
      <CodeBackground items={BLOG_SNIPPETS} className="opacity-40" />
      <Navbar />

      <main className="flex-1 relative">
        <HeroGrid>
          <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 relative z-10 py-32">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-5xl md:text-6xl font-bold mb-4">Blog</h1>
              <p className="text-gray-400 text-lg mb-8">
                Stay updated with the latest insights, tutorials, and stories from our community.
              </p>
              <div className="inline-block px-4 py-2 border border-white/10 text-gray-500 text-sm backdrop-blur-sm">
                Coming soon
              </div>
            </div>
          </div>
        </HeroGrid>
      </main>

      <Footer />
    </div>
  );
}
