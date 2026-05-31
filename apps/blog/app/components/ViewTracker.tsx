'use client';

import { useEffect } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4200/api';

export default function ViewTracker({ slug }: { slug: string }) {
  useEffect(() => {
    const key = `view:${slug}`;
    if (sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, '1');
    fetch(`${API_URL}/blog/${slug}/view`, { method: 'POST' }).catch(() => {});
  }, [slug]);

  return null;
}
