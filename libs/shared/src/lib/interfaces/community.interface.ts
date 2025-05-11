export interface ICommunity {
  id?: string;
  name: string;
  description?: string;
  kage: string;
  mentors: string[];
  members: string[];
  projects: string[];
  logo?: string;
  tags: string[];
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
