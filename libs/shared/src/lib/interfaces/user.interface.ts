import { MembershipLevel, UserRole } from '../enums';

export interface IUser {
  id?: string;
  name: string;
  email: string;
  role: UserRole;
  membershipLevel?: MembershipLevel;
  communities?: string[];
  projects?: string[];
  isActive: boolean;
  bio?: string;
  profilePicture?: string;
  experiencePoints: number;
  skills: string[];
  createdAt?: Date;
  updatedAt?: Date;
}
