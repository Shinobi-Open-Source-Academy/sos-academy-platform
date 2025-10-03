import type { MentorProps } from './mentor';

export interface CommunityMember {
  id: string;
  name: string;
  avatar: string;
  role: string;
  joinedDate: string;
  level: 'genin' | 'chunin' | 'jonin' | 'kage';
  contributions: number;
}

export interface CommunityProject {
  id: string;
  name: string;
  description: string;
  technologies: string[];
  repoUrl: string;
  demoUrl?: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  maintainers: string[];
  contributors: string[];
  status: 'active' | 'completed' | 'planned';
  startDate: string;
  completionDate?: string;
}

export interface CommunityDetails {
  id: string;
  name: string;
  slug: string;
  description: string;
  longDescription: string;
  color: string;
  icon: string;
  codeSnippet: string;
  kage?: MentorProps; // The community leader (optional - can be null if no leader assigned)
  mentors: MentorProps[];
  members: CommunityMember[];
  projects: CommunityProject[];
  meetingDay?: string;
  meetingTime?: string;
  meetingLink?: string;
  resourceLinks: {
    title: string;
    url: string;
    type: 'documentation' | 'tutorial' | 'video' | 'github' | 'discord' | 'other';
  }[];
  stats: {
    memberCount: number;
    projectCount: number;
    contributionsCount: number;
  };
}
