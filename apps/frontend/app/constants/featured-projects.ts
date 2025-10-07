export interface FeaturedProjectProps {
  title: string;
  description: string;
  githubStars: string;
  contributors: string;
  image: string;
  tags: string[];
  url: string;
  isInternal?: boolean;
}

// TODO:: Fetch from Github API paired with our server
export const FEATURED_PROJECTS: FeaturedProjectProps[] = [
  {
    title: 'Shinobi Internal Project',
    description:
      'A collaborative learning platform being developed by our community members. Join us to contribute to this exciting project and enhance your open-source skills.',
    githubStars: 'Coming Soon',
    contributors: 'Our Community',
    image: '/images/featured-projects/shinobi-internal.jpg',
    tags: ['Community', 'Learning', 'Collaboration'],
    url: '#',
    isInternal: true,
  },
  {
    title: 'Twenty',
    description:
      'Open-source CRM tool that helps businesses manage their customers and leads efficiently. It provides a modern interface with customizable workflows.',
    githubStars: '35.7k',
    contributors: '500+',
    image: '/images/featured-projects/twenty.jpeg',
    tags: ['TypeScript', 'React', 'CRM', 'Business'],
    url: 'https://github.com/twentyhq/twenty',
  },
  {
    title: 'Cal.com',
    description:
      'The open-source Calendly alternative. Cal.com is a scheduling infrastructure for teams and individuals that offers customizable booking pages and integrations.',
    githubStars: '38.3k',
    contributors: '800+',
    image: '/images/featured-projects/calcom.png',
    tags: ['TypeScript', 'Next.js', 'Scheduling', 'Calendar'],
    url: 'https://github.com/calcom/cal.com',
  },
  {
    title: 'Weaviate TypeScript Client',
    description:
      'The official TypeScript client for Weaviate vector database, making it easy to integrate vector search capabilities into TypeScript and JavaScript applications.',
    githubStars: '90',
    contributors: '20+',
    image: '/images/featured-projects/weaviate-ts.png',
    tags: ['TypeScript', 'Vector DB', 'Client Library'],
    url: 'https://github.com/weaviate/typescript-client',
  },
  {
    title: 'Redis Go Client',
    description:
      'The official Go client for Redis, providing a simple and efficient way to interact with Redis databases in Go applications with support for all Redis commands.',
    githubStars: '21k',
    contributors: '340+',
    image: '/images/featured-projects/redis-go.avif',
    tags: ['Go', 'Redis', 'Database', 'Client Library'],
    url: 'https://github.com/redis/go-redis',
  },
];
