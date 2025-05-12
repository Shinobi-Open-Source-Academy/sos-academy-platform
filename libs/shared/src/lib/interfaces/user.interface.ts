import { MembershipLevel, UserRole, UserStatus } from '../enums';

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
  createdAt?: Date;
  updatedAt?: Date;
}
