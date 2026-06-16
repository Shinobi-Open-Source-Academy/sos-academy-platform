import type { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';
import { CodeBackground, HeroGrid } from '@sos-academy/ui';
import Navbar from './components/Navbar';
import type { Post } from './_types';
import { PostCard } from './components/PostCard';
import SearchFilter from './components/SearchFilter';
import { BLOG_SNIPPETS } from './_data';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4200/api';
const WEBSITE_URL = process.env.NEXT_PUBLIC_WEBSITE_URL ?? 'http://localhost:3000';

async function getFeaturedPosts(): Promise<Post[]> {
  try {
    const res = await fetch(`${API_URL}/blog?published=true&featured=true&limit=3`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.posts ?? [];
  } catch {
    return [];
  }
}

async function getPosts(params: {
  page: number;
  search?: string;
  tag?: string;
  sortBy?: string;
  dateRange?: string;
}): Promise<{ posts: Post[]; total: number; pages: number }> {
  try {
    const qp = new URLSearchParams({ published: 'true', page: String(params.page), limit: '9' });
    if (params.search) qp.set('search', params.search);
    if (params.tag) qp.set('tag', params.tag);
    if (params.sortBy) qp.set('sortBy', params.sortBy);
    if (params.dateRange) qp.set('dateRange', params.dateRange);

    const res = await fetch(`${API_URL}/blog?${qp}`, { next: { revalidate: 60 } });
    if (!res.ok) return { posts: [], total: 0, pages: 0 };
    return res.json();
  } catch {
    return { posts: [], total: 0, pages: 0 };
  }
}

async function getTags(): Promise<string[]> {
  try {
    const res = await fetch(`${API_URL}/blog/tags`, { next: { revalidate: 300 } });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

export const metadata: Metadata = {
  title: 'Blog',
  description: 'Insights, tutorials, and stories from the Shinobi Open-Source Academy community.',
};

interface PageProps {
  searchParams?: Promise<{
    search?: string;
    tag?: string;
    page?: string;
    sortBy?: string;
    dateRange?: string;
  }>;
}

export default async function BlogPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const search = params?.search;
  const tag = params?.tag;
  const page = parseInt(params?.page ?? '1', 10);
  const sortBy = params?.sortBy ?? 'newest';
  const dateRange = params?.dateRange;

  const isFiltered = !!(search || tag || dateRange || (sortBy && sortBy !== 'newest'));

  const [featured, { posts, total, pages }, tags] = await Promise.all([
    page === 1 && !isFiltered ? getFeaturedPosts() : Promise.resolve([]),
    getPosts({ page, search, tag, sortBy, dateRange }),
    getTags(),
  ]);

  const showFeatured = featured.length > 0;

  const paginationParams = (p: number) =>
    new URLSearchParams({
      ...(search ? { search } : {}),
      ...(tag ? { tag } : {}),
      ...(sortBy && sortBy !== 'newest' ? { sortBy } : {}),
      ...(dateRange ? { dateRange } : {}),
      page: String(p),
    }).toString();

  return (
    <div className="flex flex-col min-h-screen bg-black text-white relative">
      <CodeBackground items={BLOG_SNIPPETS} className="opacity-60" />
      <Navbar websiteUrl={WEBSITE_URL} />

      {/* Hero */}
      <HeroGrid>
        <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 relative z-10 py-32">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-4">Blog</h1>
            <p className="text-gray-400 text-lg mb-8 max-w-2xl mx-auto">
              Insights, tutorials, and stories from the open-source community.
            </p>
            {total > 0 && (
              <p className="text-zinc-600 text-sm">
                {total} post{total !== 1 ? 's' : ''}
              </p>
            )}
          </div>
        </div>
      </HeroGrid>

      {/* Content */}
      <main className="flex-1 relative z-10 bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
          {/* Featured posts */}
          {showFeatured && (
            <section className="space-y-5">
              <h2 className="text-xs text-zinc-500 uppercase tracking-widest font-medium">
                Featured
              </h2>
              <div
                className={`grid gap-4 ${
                  featured.length === 1
                    ? 'grid-cols-1 max-w-2xl'
                    : featured.length === 2
                      ? 'grid-cols-1 md:grid-cols-2'
                      : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
                }`}
              >
                {featured.map((post) => (
                  <PostCard key={post._id} post={post} large />
                ))}
              </div>
            </section>
          )}

          {/* All posts */}
          <section className="space-y-8">
            {showFeatured && (
              <h2 className="text-xs text-zinc-500 uppercase tracking-widest font-medium">
                All Posts
              </h2>
            )}

            <Suspense>
              <SearchFilter
                tags={tags}
                currentTag={tag}
                currentSearch={search}
                currentSort={sortBy}
                currentDateRange={dateRange}
              />
            </Suspense>

            {posts.length === 0 ? (
              <div className="border border-white/[0.06] p-16 text-center">
                <p className="text-zinc-500 text-sm">
                  {isFiltered ? 'No posts match your filters.' : 'No posts published yet.'}
                </p>
                {isFiltered && (
                  <Link
                    href="/"
                    className="mt-3 inline-block text-sm text-white underline underline-offset-2"
                  >
                    Clear filters
                  </Link>
                )}
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {posts.map((post) => (
                    <PostCard key={post._id} post={post} />
                  ))}
                </div>

                {pages > 1 && (
                  <div className="flex items-center justify-center gap-2 pt-4">
                    {page > 1 && (
                      <Link
                        href={`/?${paginationParams(page - 1)}`}
                        className="px-4 py-2 border border-white/10 text-sm text-zinc-400 hover:border-white/30 hover:text-white transition-colors"
                      >
                        ← Previous
                      </Link>
                    )}
                    <span className="text-xs text-zinc-600 px-3">
                      {page} / {pages} · {total} posts
                    </span>
                    {page < pages && (
                      <Link
                        href={`/?${paginationParams(page + 1)}`}
                        className="px-4 py-2 border border-white/10 text-sm text-zinc-400 hover:border-white/30 hover:text-white transition-colors"
                      >
                        Next →
                      </Link>
                    )}
                  </div>
                )}
              </>
            )}
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 bg-black relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex items-center justify-between">
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
    </div>
  );
}
