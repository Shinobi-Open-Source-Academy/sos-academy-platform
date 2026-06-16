export interface PostAuthor {
  name: string;
  profilePicture?: string;
  githubProfile?: { login: string; htmlUrl: string; avatarUrl: string };
}

export interface Post {
  _id: string;
  title: string;
  slug: string;
  content?: string;
  excerpt?: string;
  coverImage?: string;
  author: PostAuthor;
  tags: string[];
  featured: boolean;
  published: boolean;
  publishedAt?: string;
  readingTime: number;
  views: number;
  reactions?: {
    heart: number;
    fire: number;
    rocket: number;
    clap: number;
    mind_blown: number;
  };
  totalReactions: number;
  createdAt: string;
}
