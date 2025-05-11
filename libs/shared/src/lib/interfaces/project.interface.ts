import { ProjectRank, ProjectStatus } from '../enums';

export interface IProject {
  id?: string;
  name: string;
  description?: string;
  rank: ProjectRank;
  status: ProjectStatus;
  owner: string;
  members: string[];
  community: string;
  startDate?: Date;
  endDate?: Date;
  githubRepo?: string;
  technologies: string[];
  thumbnail?: string;
  createdAt?: Date;
  updatedAt?: Date;
}
