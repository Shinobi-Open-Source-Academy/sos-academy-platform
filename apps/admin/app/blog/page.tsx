'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { apiClient } from '../../lib/api-client';
import { isAuthenticated } from '../../lib/auth';
import MarkdownEditor from '../components/MarkdownEditor';
import Sidebar from '../components/Sidebar';

export const dynamic = 'force-dynamic';

interface Author {
  _id?: string;
  id?: string;
  name: string;
  profilePicture?: string;
  githubProfile?: {
    login: string;
    htmlUrl: string;
    avatarUrl: string;
  };
}

interface Post {
  _id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  coverImage?: string;
  author: Author;
  tags: string[];
  featured: boolean;
  published: boolean;
  publishedAt?: string;
  readingTime: number;
  createdAt: string;
}

const emptyForm = {
  title: '',
  content: '',
  excerpt: '',
  coverImage: '',
  tags: '',
  featured: false,
  published: false,
};

function UserPicker({
  value,
  onChange,
}: {
  value: Author | null;
  onChange: (user: Author | null) => void;
}) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Author[]>([]);
  const [open, setOpen] = useState(false);
  const [searching, setSearching] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setOpen(false);
      return;
    }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await apiClient.get<{ users: Author[] }>(
          `/users/admin/users?search=${encodeURIComponent(query)}&limit=8`
        );
        setResults(res.data?.users ?? []);
        setOpen(true);
      } catch {
        setResults([]);
      } finally {
        setSearching(false);
      }
    }, 300);
  }, [query]);

  function select(user: Author) {
    onChange(user);
    setQuery('');
    setResults([]);
    setOpen(false);
  }

  const avatarUrl = value?.githubProfile?.avatarUrl ?? value?.profilePicture ?? null;
  const authorId = value?.id ?? value?._id;

  if (value && authorId) {
    return (
      <div className="flex items-center gap-3 bg-black border border-white/10 px-3 py-2">
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={value.name}
            className="w-7 h-7 rounded-full object-cover shrink-0"
          />
        ) : (
          <div className="w-7 h-7 rounded-full bg-zinc-800 flex items-center justify-center text-xs text-zinc-400 shrink-0">
            {value.name?.[0]?.toUpperCase()}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="text-sm text-white truncate">{value.name}</p>
          {value.githubProfile?.login && (
            <p className="text-xs text-zinc-500 truncate">@{value.githubProfile.login}</p>
          )}
        </div>
        <button
          type="button"
          onClick={() => onChange(null)}
          className="text-zinc-600 hover:text-white text-xs transition-colors shrink-0"
        >
          Change
        </button>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name or GitHub username..."
          className="w-full bg-black border border-white/10 px-3 py-2.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-white/30 transition-colors"
        />
        {searching && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <div className="w-3.5 h-3.5 border border-white/20 border-t-white/60 rounded-full animate-spin" />
          </div>
        )}
      </div>

      {open && results.length > 0 && (
        <div className="absolute z-20 top-full left-0 right-0 mt-1 bg-zinc-900 border border-white/10 shadow-xl max-h-64 overflow-y-auto">
          {results.map((user) => {
            const uid = user.id ?? user._id ?? '';
            const avatar = user.githubProfile?.avatarUrl ?? user.profilePicture;
            return (
              <button
                key={uid}
                type="button"
                onClick={() => select(user)}
                className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-white/5 transition-colors text-left"
              >
                {avatar ? (
                  <img
                    src={avatar}
                    alt={user.name}
                    className="w-7 h-7 rounded-full object-cover shrink-0"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-zinc-800 flex items-center justify-center text-xs text-zinc-400 shrink-0">
                    {user.name?.[0]?.toUpperCase()}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white truncate">{user.name}</p>
                  {user.githubProfile?.login && (
                    <p className="text-xs text-zinc-500 truncate">@{user.githubProfile.login}</p>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}

      {open && query && results.length === 0 && !searching && (
        <div className="absolute z-20 top-full left-0 right-0 mt-1 bg-zinc-900 border border-white/10 px-3 py-3">
          <p className="text-xs text-zinc-500">No users found</p>
        </div>
      )}
    </div>
  );
}

export default function BlogPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [formData, setFormData] = useState(emptyForm);
  const [selectedAuthor, setSelectedAuthor] = useState<Author | null>(null);

  useEffect(() => {
    setMounted(true);
    if (!isAuthenticated()) router.replace('/login');
  }, [router]);

  const fetchPosts = useCallback(async () => {
    setLoadingPosts(true);
    try {
      const res = await apiClient.get<{ posts: Post[] }>('/blog?limit=100');
      setPosts(res.data?.posts ?? []);
    } catch {
      toast.error('Failed to load posts');
    } finally {
      setLoadingPosts(false);
    }
  }, []);

  useEffect(() => {
    if (mounted) fetchPosts();
  }, [mounted, fetchPosts]);

  function openNew() {
    setEditingPost(null);
    setFormData(emptyForm);
    setSelectedAuthor(null);
    setShowForm(true);
  }

  function openEdit(post: Post) {
    setEditingPost(post);
    setFormData({
      title: post.title,
      content: post.content,
      excerpt: post.excerpt ?? '',
      coverImage: post.coverImage ?? '',
      tags: post.tags.join(', '),
      featured: post.featured,
      published: post.published,
    });
    setSelectedAuthor(post.author ?? null);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function cancelForm() {
    setShowForm(false);
    setEditingPost(null);
    setFormData(emptyForm);
    setSelectedAuthor(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!formData.title.trim() || !formData.content.trim()) {
      toast.error('Title and content are required');
      return;
    }
    const authorId = selectedAuthor?.id ?? selectedAuthor?._id;
    if (!authorId) {
      toast.error('Please select an author');
      return;
    }

    setSubmitting(true);
    const payload = {
      title: formData.title.trim(),
      content: formData.content.trim(),
      excerpt: formData.excerpt.trim() || undefined,
      coverImage: formData.coverImage.trim() || undefined,
      authorId,
      tags: formData.tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
      featured: formData.featured,
      published: formData.published,
    };

    try {
      if (editingPost) {
        await apiClient.put(`/blog/${editingPost._id}`, payload);
        toast.success('Post updated');
      } else {
        await apiClient.post('/blog', payload);
        toast.success('Post created');
      }
      cancelForm();
      fetchPosts();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to save post');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(post: Post) {
    if (!window.confirm(`Delete "${post.title}"? This cannot be undone.`)) return;
    setDeletingId(post._id);
    try {
      await apiClient.delete(`/blog/${post._id}`);
      toast.success('Post deleted');
      setPosts((prev) => prev.filter((p) => p._id !== post._id));
    } catch {
      toast.error('Failed to delete post');
    } finally {
      setDeletingId(null);
    }
  }

  async function toggleField(post: Post, field: 'featured' | 'published') {
    setTogglingId(`${post._id}-${field}`);
    try {
      const updated = await apiClient.put<Post>(`/blog/${post._id}`, { [field]: !post[field] });
      setPosts((prev) =>
        prev.map((p) => (p._id === post._id ? { ...p, ...(updated.data ?? {}) } : p))
      );
      toast.success(
        field === 'featured'
          ? post.featured
            ? 'Post unfeatured'
            : 'Post featured'
          : post.published
            ? 'Post unpublished'
            : 'Post published'
      );
    } catch {
      toast.error('Failed to update post');
    } finally {
      setTogglingId(null);
    }
  }

  if (!mounted) return null;

  return (
    <div className="flex min-h-screen bg-black text-white">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <div className="max-w-6xl mx-auto p-6 lg:p-8 space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold text-white">Blog</h1>
              <p className="text-sm text-zinc-500 mt-0.5">Manage posts for the SOS Academy blog</p>
            </div>
            {!showForm && (
              <button
                type="button"
                onClick={openNew}
                className="px-4 py-2 bg-white text-black text-sm font-medium hover:bg-zinc-100 transition-colors"
              >
                New Post
              </button>
            )}
          </div>

          {showForm && (
            <div className="border border-white/10 bg-zinc-900/50 p-6 space-y-5">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-medium text-white">
                  {editingPost ? 'Edit Post' : 'New Post'}
                </h2>
                <button
                  type="button"
                  onClick={cancelForm}
                  className="text-zinc-500 hover:text-white text-sm transition-colors"
                >
                  Cancel
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label
                      className="text-xs text-zinc-400 uppercase tracking-wider"
                      htmlFor="title"
                    >
                      Title *
                    </label>
                    <input
                      id="title"
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData((f) => ({ ...f, title: e.target.value }))}
                      placeholder="Post title"
                      required
                      className="w-full bg-black border border-white/10 px-3 py-2.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-white/30 transition-colors"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs text-zinc-400 uppercase tracking-wider">
                      Author *
                    </label>
                    <UserPicker value={selectedAuthor} onChange={setSelectedAuthor} />
                  </div>
                  <div className="space-y-1.5">
                    <label
                      className="text-xs text-zinc-400 uppercase tracking-wider"
                      htmlFor="tags"
                    >
                      Tags
                    </label>
                    <input
                      id="tags"
                      type="text"
                      value={formData.tags}
                      onChange={(e) => setFormData((f) => ({ ...f, tags: e.target.value }))}
                      placeholder="open-source, tutorial, rust (comma-separated)"
                      className="w-full bg-black border border-white/10 px-3 py-2.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-white/30 transition-colors"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label
                      className="text-xs text-zinc-400 uppercase tracking-wider"
                      htmlFor="coverImage"
                    >
                      Cover Image URL
                    </label>
                    <input
                      id="coverImage"
                      type="url"
                      value={formData.coverImage}
                      onChange={(e) => setFormData((f) => ({ ...f, coverImage: e.target.value }))}
                      placeholder="https://..."
                      className="w-full bg-black border border-white/10 px-3 py-2.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-white/30 transition-colors"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label
                    className="text-xs text-zinc-400 uppercase tracking-wider"
                    htmlFor="excerpt"
                  >
                    Excerpt (optional — auto-generated if blank)
                  </label>
                  <textarea
                    id="excerpt"
                    value={formData.excerpt}
                    onChange={(e) => setFormData((f) => ({ ...f, excerpt: e.target.value }))}
                    placeholder="Short description of the post..."
                    rows={2}
                    className="w-full bg-black border border-white/10 px-3 py-2.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-white/30 transition-colors resize-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs text-zinc-400 uppercase tracking-wider">
                    Content * (Markdown)
                  </label>
                  <MarkdownEditor
                    value={formData.content}
                    onChange={(value) => setFormData((f) => ({ ...f, content: value }))}
                    placeholder="Write your post in Markdown..."
                    rows={20}
                    required
                  />
                </div>

                <div className="flex items-center gap-6">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={formData.featured}
                      onChange={(e) => setFormData((f) => ({ ...f, featured: e.target.checked }))}
                      className="w-4 h-4 accent-white"
                    />
                    <span className="text-sm text-zinc-300">Featured</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={formData.published}
                      onChange={(e) => setFormData((f) => ({ ...f, published: e.target.checked }))}
                      className="w-4 h-4 accent-white"
                    />
                    <span className="text-sm text-zinc-300">Published</span>
                  </label>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-6 py-2.5 bg-white text-black text-sm font-medium hover:bg-zinc-100 disabled:opacity-50 transition-colors"
                  >
                    {submitting ? 'Saving...' : editingPost ? 'Save Changes' : 'Create Post'}
                  </button>
                  <button
                    type="button"
                    onClick={cancelForm}
                    className="px-4 py-2.5 text-sm text-zinc-500 hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="space-y-4">
            <h2 className="text-sm font-medium text-zinc-400 uppercase tracking-wider">
              Posts ({posts.length})
            </h2>

            {loadingPosts ? (
              <div className="flex items-center justify-center py-16">
                <div className="w-5 h-5 border-2 border-white/20 border-t-white animate-spin" />
              </div>
            ) : posts.length === 0 ? (
              <div className="border border-white/[0.06] p-12 text-center">
                <p className="text-zinc-500 text-sm">No posts yet.</p>
                <button
                  type="button"
                  onClick={openNew}
                  className="mt-4 text-sm text-white underline underline-offset-2"
                >
                  Create your first post
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                {posts.map((post) => {
                  const authorAvatar =
                    post.author?.githubProfile?.avatarUrl ?? post.author?.profilePicture;
                  const authorGithub = post.author?.githubProfile?.login;
                  return (
                    <div
                      key={post._id}
                      className="border border-white/[0.06] bg-zinc-900/30 p-4 flex items-start gap-4"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-sm font-medium text-white truncate">{post.title}</h3>
                          {post.featured && (
                            <span className="px-1.5 py-0.5 text-[10px] bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 uppercase tracking-wider">
                              Featured
                            </span>
                          )}
                          <span
                            className={`px-1.5 py-0.5 text-[10px] uppercase tracking-wider border ${post.published ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-zinc-800 text-zinc-500 border-white/[0.06]'}`}
                          >
                            {post.published ? 'Published' : 'Draft'}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                          {post.author && (
                            <div className="flex items-center gap-1.5">
                              {authorAvatar ? (
                                <img
                                  src={authorAvatar}
                                  alt={post.author.name}
                                  className="w-4 h-4 rounded-full object-cover"
                                />
                              ) : (
                                <div className="w-4 h-4 rounded-full bg-zinc-700 flex items-center justify-center text-[8px] text-zinc-400">
                                  {post.author.name?.[0]?.toUpperCase()}
                                </div>
                              )}
                              <span className="text-xs text-zinc-400">{post.author.name}</span>
                              {authorGithub && (
                                <span className="text-xs text-zinc-600">@{authorGithub}</span>
                              )}
                            </div>
                          )}
                          <span className="text-xs text-zinc-600">·</span>
                          <span className="text-xs text-zinc-500">{post.readingTime} min read</span>
                          {post.tags.length > 0 && (
                            <>
                              <span className="text-xs text-zinc-600">·</span>
                              <span className="text-xs text-zinc-500">
                                {post.tags.slice(0, 3).join(', ')}
                                {post.tags.length > 3 && ` +${post.tags.length - 3}`}
                              </span>
                            </>
                          )}
                          <span className="text-xs text-zinc-600">·</span>
                          <span className="text-xs text-zinc-600">
                            {new Date(post.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        {post.excerpt && (
                          <p className="text-xs text-zinc-600 mt-1.5 line-clamp-2">
                            {post.excerpt}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => toggleField(post, 'featured')}
                          disabled={togglingId === `${post._id}-featured`}
                          title={post.featured ? 'Unfeature' : 'Feature'}
                          className={`px-2.5 py-1.5 text-xs transition-colors disabled:opacity-40 ${post.featured ? 'text-yellow-400 hover:text-zinc-400' : 'text-zinc-600 hover:text-yellow-400'}`}
                        >
                          {togglingId === `${post._id}-featured` ? '...' : '★'}
                        </button>
                        <button
                          type="button"
                          onClick={() => toggleField(post, 'published')}
                          disabled={togglingId === `${post._id}-published`}
                          className={`px-2.5 py-1.5 text-xs transition-colors disabled:opacity-40 ${post.published ? 'text-green-400 hover:text-zinc-400' : 'text-zinc-600 hover:text-green-400'}`}
                        >
                          {togglingId === `${post._id}-published`
                            ? '...'
                            : post.published
                              ? 'Unpublish'
                              : 'Publish'}
                        </button>
                        <button
                          type="button"
                          onClick={() => openEdit(post)}
                          className="px-2.5 py-1.5 text-xs text-zinc-500 hover:text-white transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(post)}
                          disabled={deletingId === post._id}
                          className="px-2.5 py-1.5 text-xs text-zinc-600 hover:text-red-400 transition-colors disabled:opacity-40"
                        >
                          {deletingId === post._id ? '...' : 'Delete'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
