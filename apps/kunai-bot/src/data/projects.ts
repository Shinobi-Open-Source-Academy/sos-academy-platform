export interface CommunityProject {
  name: string;
  repo: string; // owner/repo
  language: string;
}

// Mirrors the featured projects on the website (apps/website/lib/data.ts)
// so mentors and hackers get pointed at repos the Academy already vouches for.
export const COMMUNITY_PROJECTS: CommunityProject[] = [
  { name: 'Twenty', repo: 'twentyhq/twenty', language: 'TypeScript' },
  { name: 'Cal.com', repo: 'calcom/cal.com', language: 'TypeScript' },
  {
    name: 'Weaviate TypeScript Client',
    repo: 'weaviate/typescript-client',
    language: 'TypeScript',
  },
  { name: 'Redis Go Client', repo: 'redis/go-redis', language: 'Go' },
];
