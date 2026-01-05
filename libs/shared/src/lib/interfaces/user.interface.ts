import type { MembershipLevel, UserRole, UserStatus } from '../enums';

export interface IGitHubProfile {
  login: string;
  githubId: number;
  avatarUrl?: string;
  htmlUrl?: string;
  publicRepos?: number;
  followers?: number;
  following?: number;
  createdAt?: Date;
  lastUpdated: Date;
  email?: string;
  bio?: string;
  location?: string;
  company?: string;
  blog?: string;
  twitterUsername?: string;
}

export interface IUser {
  id?: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  membershipLevel?: MembershipLevel;
  communities?: string[];
  projects?: string[];
  isActive: boolean;
  bio?: string;
  profilePicture?: string;
  experiencePoints: number;
  skills: string[];
  interests: string[];
  githubProfile?: IGitHubProfile;
  createdAt?: Date;
  updatedAt?: Date;
}
