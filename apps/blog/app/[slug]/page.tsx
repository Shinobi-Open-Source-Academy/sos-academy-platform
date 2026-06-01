import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import CodeBackground from '../components/CodeBackground';
import Navbar from '../components/Navbar';
import Reactions from '../components/Reactions';
import ViewTracker from '../components/ViewTracker';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4200/api';
const WEBSITE_URL = process.env.NEXT_PUBLIC_WEBSITE_URL ?? 'http://localhost:3000';

interface Post {
  _id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  coverImage?: string;
  author: {
    name: string;
    profilePicture?: string;
    githubProfile?: { login: string; htmlUrl: string; avatarUrl: string };
  };
  tags: string[];
  featured: boolean;
  published: boolean;
  publishedAt?: string;
  readingTime: number;
  views: number;
  reactions: {
    heart: number;
    fire: number;
    rocket: number;
    clap: number;
    mind_blown: number;
  };
  totalReactions: number;
  createdAt: string;
}

async function getPost(slug: string): Promise<Post | null> {
  try {
    const res = await fetch(`${API_URL}/blog/${slug}`, { next: { revalidate: 60 } });
    if (res.status === 404) return null;
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

function markdownToHtml(md: string): string {
  let html = md.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  // Fenced code blocks
  html = html.replace(
    /```(?:\w+)?\n?([\s\S]*?)```/gm,
    (_, code) => `<pre><code>${code.trim()}</code></pre>`
  );

  // Inline code
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

  // Headers
  html = html.replace(/^#### (.*$)/gm, '<h4>$1</h4>');
  html = html.replace(/^### (.*$)/gm, '<h3>$1</h3>');
  html = html.replace(/^## (.*$)/gm, '<h2>$1</h2>');
  html = html.replace(/^# (.*$)/gm, '<h1>$1</h1>');

  // Horizontal rule
  html = html.replace(/^---$/gm, '<hr>');

  // Blockquotes
  html = html.replace(/^&gt; (.*$)/gm, '<blockquote>$1</blockquote>');

  // Bold/italic
  html = html.replace(/\*\*\*(.*?)\*\*\*/g, '<strong><em>$1</em></strong>');
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/__(.*?)__/g, '<strong>$1</strong>');
  html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
  html = html.replace(/_(.*?)_/g, '<em>$1</em>');

  // Images before links
  html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1">');

  // Links
  html = html.replace(
    /\[([^\]]+)\]\(([^)]+)\)/g,
    '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>'
  );

  // Lists
  html = html.replace(/^[*-] (.*)$/gm, '<li>$1</li>');
  html = html.replace(/(<li>.*<\/li>\n?)+/g, (match) => `<ul>${match}</ul>`);
  html = html.replace(/^\d+\. (.*)$/gm, '<li>$1</li>');

  // Paragraphs
  const blockTags = /^<(h[1-6]|pre|ul|ol|li|blockquote|hr|img)/;
  html = html
    .split('\n\n')
    .map((block) => {
      const trimmed = block.trim();
      if (!trimmed) return '';
      if (blockTags.test(trimmed)) return trimmed;
      return `<p>${trimmed.replace(/\n/g, '<br>')}</p>`;
    })
    .join('\n');

  return html;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return { title: 'Post not found' };

  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: 'article',
      publishedTime: post.publishedAt,
      authors: [post.author.name],
      images: post.coverImage ? [{ url: post.coverImage }] : [],
    },
  };
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function PostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = await getPost(slug);

  if (!post || !post.published) notFound();

  const html = markdownToHtml(post.content);

  const initialReactions = post.reactions ?? {
    heart: 0,
    fire: 0,
    rocket: 0,
    clap: 0,
    mind_blown: 0,
  };

  return (
    <div className="min-h-screen bg-black text-white relative">
      <CodeBackground />
      <Navbar websiteUrl={WEBSITE_URL} />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-24 md:py-32">
        {/* Back link */}
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-white transition-colors mb-10"
        >
          <svg
            className="w-3.5 h-3.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <title>Back</title>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
            />
          </svg>
          All posts
        </Link>

        <article>
          {/* Post header */}
          <header className="space-y-5 mb-10">
            {post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {post.tags.map((tag) => (
                  <Link
                    key={tag}
                    href={`/?tag=${encodeURIComponent(tag)}`}
                    className="text-[10px] px-2 py-0.5 border border-white/10 text-zinc-500 uppercase tracking-wider hover:border-white/30 hover:text-zinc-300 transition-colors"
                  >
                    {tag}
                  </Link>
                ))}
              </div>
            )}

            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight">
              {post.title}
            </h1>

            {post.excerpt && (
              <p className="text-lg text-zinc-400 leading-relaxed">{post.excerpt}</p>
            )}

            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-zinc-500 pt-1">
              {post.author?.githubProfile?.htmlUrl ? (
                <a
                  href={post.author.githubProfile.htmlUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-zinc-300 hover:text-white transition-colors"
                >
                  {(post.author.githubProfile.avatarUrl ?? post.author.profilePicture) && (
                    <img
                      src={post.author.githubProfile.avatarUrl ?? post.author.profilePicture}
                      alt={post.author.name}
                      className="w-6 h-6 rounded-full object-cover"
                    />
                  )}
                  <span className="font-medium">{post.author.name}</span>
                  <span className="text-zinc-600 text-xs">@{post.author.githubProfile.login}</span>
                </a>
              ) : (
                <span className="font-medium text-zinc-300">{post.author?.name}</span>
              )}
              <span>·</span>
              <span>{formatDate(post.publishedAt ?? post.createdAt)}</span>
              <span>·</span>
              <span>{post.readingTime} min read</span>
              {post.views > 0 && (
                <>
                  <span>·</span>
                  <span>{post.views} reads</span>
                </>
              )}
            </div>
          </header>

          {/* Cover image */}
          {post.coverImage && (
            <div className="relative w-full h-72 md:h-96 overflow-hidden mb-10 border border-white/[0.06]">
              <Image
                src={post.coverImage}
                alt={post.title}
                fill
                sizes="(max-width: 1280px) 100vw, 1280px"
                className="object-cover"
                priority
              />
            </div>
          )}

          {/* Content */}
          <div
            className="prose max-w-none"
            // biome-ignore lint/security/noDangerouslySetInnerHtml: markdown content is stored server-side, authored by admins
            dangerouslySetInnerHTML={{ __html: html }}
          />

          {/* Reactions */}
          <div className="mt-12 pt-8 border-t border-white/[0.06]">
            <Reactions slug={post.slug} initialReactions={initialReactions} />
          </div>
        </article>

        {/* Footer nav */}
        <div className="mt-12 pt-8 border-t border-white/[0.06]">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-white transition-colors"
          >
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <title>Back</title>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
              />
            </svg>
            Back to all posts
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 flex items-center justify-between">
          <p className="text-sm text-gray-500">
            © {new Date().getFullYear()} Shinobi Open-Source Academy. All rights reserved.
          </p>
          <a
            href={WEBSITE_URL}
            className="text-sm text-gray-400 hover:text-white transition-colors"
          >
            shinobi-open-source.academy
          </a>
        </div>
      </footer>

      <ViewTracker slug={post.slug} />
    </div>
  );
}
