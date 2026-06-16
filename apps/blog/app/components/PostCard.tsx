'use client';

import { formatDate } from '@sos-academy/shared';
import { SpotlightCard } from '@sos-academy/ui';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import type { Post } from '../_types';

export type { Post };

export function PostCard({ post, large = false }: { post: Post; large?: boolean }) {
  const router = useRouter();

  return (
    <SpotlightCard
      role="link"
      tabIndex={0}
      onClick={() => router.push(`/${post.slug}`)}
      onKeyDown={(e) => e.key === 'Enter' && router.push(`/${post.slug}`)}
      className="group border border-white/[0.06] bg-zinc-900/30 hover:border-white/20 transition-all duration-300 cursor-pointer flex flex-col"
    >
      {post.coverImage ? (
        <div className={`relative w-full overflow-hidden flex-shrink-0 ${large ? 'h-56' : 'h-44'}`}>
          <Image
            src={post.coverImage}
            alt={post.title}
            fill
            className="object-cover group-hover:scale-[1.04] transition-transform duration-700 ease-out"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/70 via-transparent to-transparent" />
        </div>
      ) : (
        <div
          className={`w-full flex-shrink-0 flex items-center justify-center border-b border-white/5 bg-zinc-900/50 ${large ? 'h-56' : 'h-44'}`}
        >
          <span className="text-5xl font-black text-zinc-800 select-none uppercase">
            {post.title.charAt(0)}
          </span>
        </div>
      )}

      {/* Content */}
      <div className={`flex flex-col gap-2.5 flex-1 ${large ? 'p-5' : 'p-4'}`}>
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
          className={`font-semibold text-white group-hover:text-zinc-100 leading-snug ${large ? 'text-xl' : 'text-sm'}`}
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

        {/* Meta — pushed to bottom */}
        <div className="flex items-center gap-1.5 text-xs text-zinc-600 mt-auto pt-2 border-t border-white/[0.04]">
          {post.author?.githubProfile?.avatarUrl && (
            <img
              src={post.author.githubProfile.avatarUrl}
              alt={post.author.name}
              className="w-4 h-4 rounded-full object-cover flex-shrink-0"
            />
          )}
          {post.author?.githubProfile?.htmlUrl ? (
            <a
              href={post.author.githubProfile.htmlUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-zinc-300 transition-colors truncate"
              onClick={(e) => e.stopPropagation()}
            >
              {post.author.name}
            </a>
          ) : (
            <span className="truncate">{post.author?.name}</span>
          )}
          <span className="text-zinc-700 flex-shrink-0">·</span>
          <span className="flex-shrink-0">{formatDate(post.publishedAt ?? post.createdAt)}</span>
          <span className="text-zinc-700 flex-shrink-0">·</span>
          <span className="flex-shrink-0">{post.readingTime} min</span>
          {post.views > 0 && (
            <>
              <span className="text-zinc-700 flex-shrink-0">·</span>
              <span className="flex-shrink-0">{post.views.toLocaleString()} reads</span>
            </>
          )}
        </div>
      </div>
    </SpotlightCard>
  );
}
