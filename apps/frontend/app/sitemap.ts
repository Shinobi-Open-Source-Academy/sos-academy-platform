import type { MetadataRoute } from 'next';
import { COMMUNITIES } from '../lib/data';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://shinobiopensource.academy';

  const communityPages = COMMUNITIES.map((community) => ({
    url: `${baseUrl}/communities/${community.id}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    ...communityPages,
  ];
}
