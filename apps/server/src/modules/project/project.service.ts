import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { GitHubService } from '../github/github.service';
import { Project, ProjectDocument } from './schemas/project.schema';
import { Community, CommunityDocument } from '../community/schemas/community.schema';

interface ProjectStats {
  stars: number;
  contributors: number;
  lastUpdated: Date;
  website: string | null;
}

@Injectable()
export class ProjectService {
  private readonly logger = new Logger(ProjectService.name);
  private statsCache = new Map<string, { stats: ProjectStats; timestamp: number }>();
  private readonly CACHE_TTL = 60 * 60 * 1000; // 1 hour cache
  private readonly inFlightRequests = new Map<string, Promise<ProjectStats | null>>(); // Prevent duplicate concurrent requests

  constructor(
    @InjectModel(Project.name) private projectModel: Model<ProjectDocument>,
    @InjectModel(Community.name) private communityModel: Model<CommunityDocument>,
    private readonly githubService: GitHubService
  ) {}

  /**
   * Fetch GitHub stats for a project with caching and deduplication
   * @param project Project document (can be lean or full document)
   * @returns Project stats or null if fetch fails
   */
  async fetchProjectStats(project: ProjectDocument | any): Promise<ProjectStats | null> {
    if (!project.githubRepo) {
      return null;
    }

    // Get project ID (handles both ObjectId and string)
    const projectId = project._id?.toString() || project._id;
    if (!projectId) {
      return null;
    }

    // Check cache first
    const cacheKey = projectId;
    const cached = this.statsCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      this.logger.debug(`Using cached stats for project ${project.name || projectId}`);
      return cached.stats;
    }

    // Check if there's already an in-flight request for this project
    const inFlightRequest = this.inFlightRequests.get(project.githubRepo);
    if (inFlightRequest) {
      this.logger.debug(`Reusing in-flight request for ${project.githubRepo}`);
      return inFlightRequest;
    }

    // Create new request and store it to prevent duplicates
    const requestPromise = (async () => {
      try {
        const stats = await this.githubService.fetchRepositoryStats(project.githubRepo);
        if (stats) {
          // Update cache
          this.statsCache.set(cacheKey, { stats, timestamp: Date.now() });
          // Update database (non-blocking)
          this.updateProjectStats(projectId, stats).catch((err) => {
            this.logger.warn(`Failed to update project stats in DB: ${err.message}`);
          });
          return stats;
        }
        return null;
      } catch (error) {
        this.logger.error(
          `Failed to fetch stats for project ${project.name || projectId}: ${error instanceof Error ? error.message : String(error)}`
        );
        return null;
      } finally {
        // Remove from in-flight requests when done
        this.inFlightRequests.delete(project.githubRepo);
      }
    })();

    // Store the promise to prevent duplicate requests
    this.inFlightRequests.set(project.githubRepo, requestPromise);

    return requestPromise;
  }

  /**
   * Fetch stats for multiple projects in parallel (with rate limiting)
   * @param projects Array of project documents
   * @returns Map of project ID to stats
   */
  async fetchMultipleProjectStats(
    projects: Array<ProjectDocument | any>
  ): Promise<Map<string, ProjectStats>> {
    const statsMap = new Map<string, ProjectStats>();
    const projectsToFetch: Array<{ id: string; project: ProjectDocument | any }> = [];

    // Check cache for each project
    for (const project of projects) {
      if (!project.githubRepo) {
        continue;
      }

      const projectId = project._id?.toString() || project._id;
      if (!projectId) {
        continue;
      }

      const cacheKey = projectId;
      const cached = this.statsCache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
        statsMap.set(cacheKey, cached.stats);
      } else {
        projectsToFetch.push({ id: cacheKey, project });
      }
    }

    // Fetch stats for projects not in cache (with delay to avoid rate limiting)
    // Use a Set to deduplicate by githubRepo to avoid fetching the same repo multiple times
    const uniqueRepos = new Map<string, Array<{ id: string; project: ProjectDocument | any }>>();
    for (const item of projectsToFetch) {
      const repoUrl = item.project.githubRepo;
      if (!uniqueRepos.has(repoUrl)) {
        uniqueRepos.set(repoUrl, []);
      }
      uniqueRepos.get(repoUrl)!.push(item);
    }

    // Fetch each unique repo once, then apply results to all projects with that repo
    const uniqueReposArray = Array.from(uniqueRepos.entries());
    for (let i = 0; i < uniqueReposArray.length; i++) {
      const [repoUrl, projects] = uniqueReposArray[i];
      const stats = await this.fetchProjectStats(projects[0].project);

      // Apply stats to all projects with this repo URL
      if (stats) {
        for (const { id } of projects) {
          statsMap.set(id, stats);
        }
      }

      // Delay between requests to avoid rate limiting (except for last item)
      if (i < uniqueReposArray.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, 300));
      }
    }

    return statsMap;
  }

  /**
   * Update project stats in database
   * @param projectId Project ID
   * @param stats Stats to update
   */
  private async updateProjectStats(projectId: string, stats: ProjectStats): Promise<void> {
    await this.projectModel.updateOne(
      { _id: projectId },
      {
        $set: {
          stars: stats.stars,
          contributors: stats.contributors,
          lastUpdated: stats.lastUpdated,
          website: stats.website || undefined,
        },
      }
    );
  }

  /**
   * Clear stats cache (useful for testing or manual refresh)
   */
  clearCache(): void {
    this.statsCache.clear();
  }

  /**
   * Get projects with pagination, filtering, and sorting
   */
  async getProjects(query: {
    community?: string;
    search?: string;
    sortBy?: string;
    order?: string;
    page?: number;
    limit?: number;
  }) {
    const { community, search, sortBy = 'rank', order = 'asc', page = 1, limit = 10 } = query;

    // Normalize pagination
    const normalizedLimit = Math.min(Math.max(limit, 1), 50);
    const normalizedPage = Math.max(page, 1);
    const skip = (normalizedPage - 1) * normalizedLimit;

    // Build filter
    const filter: Record<string, unknown> = {};

    // Filter by community
    if (community) {
      const communityDoc = await this.communityModel
        .findOne({ slug: community })
        .select('_id')
        .lean()
        .exec();
      if (communityDoc) {
        filter.community = communityDoc._id;
      } else {
        // Return empty if community not found
        return {
          projects: [],
          pagination: {
            total: 0,
            page: normalizedPage,
            limit: normalizedLimit,
            pages: 0,
          },
        };
      }
    }

    // Search filter
    if (search) {
      const safeSearch = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(safeSearch, 'i');
      filter.$or = [{ name: regex }, { description: regex }, { technologies: { $in: [regex] } }];
    }

    // Build sort
    let sort: Record<string, 1 | -1> = {};
    const sortOrder = order === 'desc' ? -1 : 1;

    switch (sortBy) {
      case 'rank': {
        // Custom sort for rank: A first, then S, then B, C, D
        // We'll sort by rank field and handle A/S ordering in application logic
        sort = { rank: sortOrder };
        break;
      }
      case 'latest': {
        sort = { lastUpdated: sortOrder };
        break;
      }
      case 'stars': {
        sort = { stars: sortOrder };
        break;
      }
      case 'name': {
        sort = { name: sortOrder };
        break;
      }
      default: {
        sort = { rank: sortOrder };
      }
    }

    // Query projects
    const [projects, total] = await Promise.all([
      this.projectModel
        .find(filter)
        .select(
          'name description url website stars contributors lastUpdated technologies rank githubRepo'
        )
        .populate({ path: 'community', select: 'name slug', options: { lean: true } })
        .sort(sort)
        .skip(skip)
        .limit(normalizedLimit)
        .lean()
        .exec(),
      this.projectModel.countDocuments(filter).exec(),
    ]);

    // Custom sort for rank (A first, then S, then B, C, D)
    if (sortBy === 'rank') {
      const rankOrder: Record<string, number> = { A: 0, S: 1, B: 2, C: 3, D: 4 };
      projects.sort((a, b) => {
        const aRank = rankOrder[a.rank || 'D'] ?? 5;
        const bRank = rankOrder[b.rank || 'D'] ?? 5;
        const comparison = aRank - bRank;
        // For ascending: A (0) < S (1) < B (2) < C (3) < D (4)
        // For descending: D (4) > C (3) > B (2) > S (1) > A (0)
        return order === 'desc' ? -comparison : comparison;
      });
    }

    return {
      projects,
      pagination: {
        total,
        page: normalizedPage,
        limit: normalizedLimit,
        pages: Math.ceil(total / normalizedLimit),
      },
    };
  }
}
