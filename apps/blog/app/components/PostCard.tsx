'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import SpotlightCard from './SpotlightCard';

interface PostAuthor {
  name: string;
  profilePicture?: string;
  githubProfile?: { login: string; htmlUrl: string; avatarUrl: string };
}

export interface Post {
  _id: string;
  title: string;
  slug: string;
  excerpt?: string;
  coverImage?: string;
  author: PostAuthor;
  tags: string[];
  featured: boolean;
  published: boolean;
  publishedAt?: string;
  readingTime: number;
  views: number;
  totalReactions: number;
  createdAt: string;
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function PostCard({ post, large = false }: { post: Post; large?: boolean }) {
  const router = useRouter();

  return (
    <SpotlightCard
      role="link"
      tabIndex={0}
      onClick={() => router.push(`/${post.slug}`)}
      onKeyDown={(e) => e.key === 'Enter' && router.push(`/${post.slug}`)}
      className={`group block border border-white/[0.06] bg-zinc-900/30 hover:border-white/20 hover:bg-zinc-900/60 transition-all cursor-pointer ${large ? 'p-6' : 'p-5'}`}
    >
      {post.coverImage && (
        <div className={`relative w-full overflow-hidden mb-4 ${large ? 'h-52' : 'h-40'}`}>
          <Image
            src={post.coverImage}
            alt={post.title}
            fill
            className="object-cover group-hover:scale-[1.02] transition-transform duration-500"
          />
        </div>
      )}
      <div className="space-y-2">
        {post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {post.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="text-[10px] px-2 py-0.5 border border-white/10 text-zinc-500 uppercase tracking-wider"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
        <h2
          className={`font-semibold text-white group-hover:text-zinc-100 transition-colors leading-snug ${large ? 'text-xl' : 'text-base'}`}
        >
          {post.title}
        </h2>
        {post.excerpt && (
          <p
            className={`text-zinc-500 leading-relaxed line-clamp-2 ${large ? 'text-sm' : 'text-xs'}`}
          >
            {post.excerpt}
          </p>
        )}
        <div className="flex items-center gap-2 text-xs text-zinc-600 pt-1">
          {post.author?.githubProfile?.htmlUrl ? (
            <a
              href={post.author.githubProfile.htmlUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 hover:text-zinc-300 transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              {post.author.githubProfile.avatarUrl && (
                <img
                  src={post.author.githubProfile.avatarUrl}
                  alt={post.author.name}
                  className="w-4 h-4 rounded-full object-cover"
                />
              )}
              <span>{post.author.name}</span>
            </a>
          ) : (
            <span>{post.author?.name}</span>
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
          {post.totalReactions > 0 && (
            <>
              <span>·</span>
              <span>{post.totalReactions} reactions</span>
            </>
          )}
        </div>
      </div>
    </SpotlightCard>
  );
}
