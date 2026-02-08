import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ProjectRank, ProjectStatus, UserRole, UserStatus } from '@sos-academy/shared';
import * as bcrypt from 'bcryptjs';
import { Model } from 'mongoose';
import { envConfig } from '../../common/config/env.config';
import { Community, CommunityDocument } from '../community/schemas/community.schema';
import { GitHubService } from '../github/github.service';
import { Project, ProjectDocument } from '../project/schemas/project.schema';
import { User, UserDocument } from '../user/schemas/user.schema';

export interface SeedingResult {
  success: boolean;
  count: number;
  message: string;
}

export interface DatabaseStatus {
  totalCommunities: number;
  activeCommunities: number;
  inactiveCommunities: number;
  communities: Array<{
    name: string;
    isActive: boolean;
  }>;
}

@Injectable()
export class SeederService {
  private readonly logger = new Logger(SeederService.name);

  // Seed data - clean language names with Naruto-inspired slugs
  private readonly COMMUNITIES_DATA = [
    {
      name: 'JavaScript',
      slug: 'konoha',
      description:
        'Master modern JavaScript and its frameworks while contributing to web-focused open-source projects.',
      tags: ['javascript', 'web', 'frontend', 'nodejs', 'react', 'vue'],
      isActive: true,
    },
    {
      name: 'Python',
      slug: 'suna',
      description:
        'Dive into Python development and contribute to data science, automation, and web backend projects.',
      tags: ['python', 'data-science', 'backend', 'django', 'flask', 'fastapi'],
      isActive: true,
    },
    {
      name: 'Go',
      slug: 'kiri',
      description:
        'Build high-performance, concurrent systems and microservices with Go language expertise.',
      tags: ['go', 'golang', 'microservices', 'backend', 'concurrency', 'performance'],
      isActive: true,
    },
    {
      name: 'Java',
      slug: 'iwa',
      description:
        'Focus on enterprise-grade applications, Android development, and Java-based open-source projects.',
      tags: ['java', 'enterprise', 'android', 'spring', 'backend', 'jvm'],
      isActive: true,
    },
    {
      name: 'Ruby',
      slug: 'taki',
      description:
        'Contribute to elegant, readable codebases and web applications using Ruby and Rails.',
      tags: ['ruby', 'rails', 'web', 'backend', 'elegant', 'readable'],
      isActive: true,
    },
    {
      name: 'Rust',
      slug: 'kumo',
      description:
        'Build memory-safe, high-performance systems and contribute to cutting-edge Rust projects.',
      tags: ['rust', 'systems', 'performance', 'memory-safe', 'backend', 'blockchain'],
      isActive: true,
    },
    {
      name: 'PHP',
      slug: 'ame',
      description:
        'Build dynamic web applications and contribute to PHP-based open-source projects and frameworks.',
      tags: ['php', 'web', 'backend', 'laravel', 'symfony', 'wordpress'],
      isActive: true,
    },
  ];

  // top 4 - 6 projects per community (based on popularity and contribution opportunities)
  private readonly PROJECTS_DATA = {
    konoha: [
      {
        name: 'Cal.com',
        description: 'Scheduling infrastructure for everyone',
        githubRepo: 'https://github.com/calcom/cal.com',
        url: 'https://cal.com',
        technologies: ['typescript', 'nextjs', 'react', 'scheduling'],
        rank: ProjectRank.S,
      },
      {
        name: 'Twenty CRM',
        description: 'Contributing to the open-source CRM platform',
        githubRepo: 'https://github.com/twentyhq/twenty',
        url: 'https://twenty.com',
        technologies: ['typescript', 'react', 'crm', 'open-source'],
        rank: ProjectRank.D,
      },
      {
        name: 'React',
        description: 'A JavaScript library for building user interfaces',
        githubRepo: 'https://github.com/facebook/react',
        url: 'https://github.com/facebook/react',
        technologies: ['javascript', 'react', 'frontend', 'ui'],
        rank: ProjectRank.S,
      },
      {
        name: 'Next.js',
        description: 'The React Framework for Production',
        githubRepo: 'https://github.com/vercel/next.js',
        url: 'https://github.com/vercel/next.js',
        technologies: ['javascript', 'react', 'nextjs', 'fullstack'],
        rank: ProjectRank.S,
      },
      {
        name: 'shadcn/ui',
        description: 'Beautifully designed components built with Radix UI and Tailwind CSS',
        githubRepo: 'https://github.com/shadcn-ui/ui',
        url: 'https://github.com/shadcn-ui/ui',
        technologies: ['typescript', 'react', 'tailwindcss', 'ui'],
        rank: ProjectRank.A,
      },
      {
        name: 'Vite',
        description: 'Next generation frontend tooling',
        githubRepo: 'https://github.com/vitejs/vite',
        url: 'https://github.com/vitejs/vite',
        technologies: ['javascript', 'typescript', 'build-tool', 'bundler'],
        rank: ProjectRank.A,
      },
    ],
    suna: [
      {
        name: 'FastAPI',
        description: 'Modern, fast (high-performance), web framework for building APIs with Python',
        githubRepo: 'https://github.com/tiangolo/fastapi',
        url: 'https://github.com/tiangolo/fastapi',
        technologies: ['python', 'fastapi', 'api', 'async'],
        rank: ProjectRank.S,
      },
      {
        name: 'Django',
        description: 'The web framework for perfectionists with deadlines',
        githubRepo: 'https://github.com/django/django',
        url: 'https://github.com/django/django',
        technologies: ['python', 'django', 'web-framework', 'orm'],
        rank: ProjectRank.S,
      },
      {
        name: 'SQLModel',
        description: 'SQL databases in Python, designed for simplicity, compatibility, and robustness',
        githubRepo: 'https://github.com/tiangolo/sqlmodel',
        url: 'https://github.com/tiangolo/sqlmodel',
        technologies: ['python', 'sql', 'orm', 'database'],
        rank: ProjectRank.A,
      },
      {
        name: 'Typer',
        description: 'Build great CLIs. Easy to code. Based on Python type hints',
        githubRepo: 'https://github.com/tiangolo/typer',
        url: 'https://github.com/tiangolo/typer',
        technologies: ['python', 'cli', 'typing', 'terminal'],
        rank: ProjectRank.B,
      },
    ],
    kiri: [
      {
        name: 'Gin',
        description: 'A HTTP web framework written in Go',
        githubRepo: 'https://github.com/gin-gonic/gin',
        url: 'https://github.com/gin-gonic/gin',
        technologies: ['go', 'golang', 'web-framework', 'http'],
        rank: ProjectRank.S,
      },
      {
        name: 'Hugo',
        description: 'The world\'s fastest framework for building websites',
        githubRepo: 'https://github.com/gohugoio/hugo',
        url: 'https://github.com/gohugoio/hugo',
        technologies: ['go', 'static-site', 'ssg', 'hugo'],
        rank: ProjectRank.A,
      },
      {
        name: 'Caddy',
        description: 'Fast and extensible multi-platform HTTP/1-2-3 web server with automatic HTTPS',
        githubRepo: 'https://github.com/caddyserver/caddy',
        url: 'https://github.com/caddyserver/caddy',
        technologies: ['go', 'web-server', 'https', 'reverse-proxy'],
        rank: ProjectRank.A,
      },
      {
        name: 'Traefik',
        description: 'The Cloud Native Application Proxy',
        githubRepo: 'https://github.com/traefik/traefik',
        url: 'https://github.com/traefik/traefik',
        technologies: ['go', 'reverse-proxy', 'load-balancer', 'cloud-native'],
        rank: ProjectRank.A,
      },
    ],
    iwa: [
      {
        name: 'Spring Boot',
        description: 'Spring Boot makes it easy to create stand-alone, production-grade Spring based Applications',
        githubRepo: 'https://github.com/spring-projects/spring-boot',
        url: 'https://github.com/spring-projects/spring-boot',
        technologies: ['java', 'spring', 'spring-boot', 'framework'],
        rank: ProjectRank.S,
      },
      {
        name: 'Spring Framework',
        description: 'Spring Framework provides a comprehensive programming and configuration model',
        githubRepo: 'https://github.com/spring-projects/spring-framework',
        url: 'https://github.com/spring-projects/spring-framework',
        technologies: ['java', 'spring', 'framework', 'dependency-injection'],
        rank: ProjectRank.S,
      },
      {
        name: 'Spring Cloud',
        description: 'Spring Cloud provides tools for developers to quickly build distributed systems',
        githubRepo: 'https://github.com/spring-cloud/spring-cloud',
        url: 'https://github.com/spring-cloud/spring-cloud',
        technologies: ['java', 'spring', 'microservices', 'cloud'],
        rank: ProjectRank.A,
      },
      {
        name: 'Spring Security',
        description: 'Spring Security is a powerful and highly customizable authentication and access-control framework',
        githubRepo: 'https://github.com/spring-projects/spring-security',
        url: 'https://github.com/spring-projects/spring-security',
        technologies: ['java', 'spring', 'security', 'authentication'],
        rank: ProjectRank.A,
      },
    ],
    taki: [
      {
        name: 'Mastodon',
        description: 'Your self-hosted, globally interconnected microblogging community',
        githubRepo: 'https://github.com/mastodon/mastodon',
        url: 'https://github.com/mastodon/mastodon',
        technologies: ['ruby', 'rails', 'social-network', 'mastodon'],
        rank: ProjectRank.S,
      },
      {
        name: 'Discourse',
        description: 'A platform for community discussion',
        githubRepo: 'https://github.com/discourse/discourse',
        url: 'https://github.com/discourse/discourse',
        technologies: ['ruby', 'rails', 'forum', 'discussion'],
        rank: ProjectRank.S,
      },
      {
        name: 'GitLab',
        description: 'GitLab is a complete DevOps platform',
        githubRepo: 'https://github.com/gitlabhq/gitlabhq',
        url: 'https://github.com/gitlabhq/gitlabhq',
        technologies: ['ruby', 'rails', 'git', 'devops'],
        rank: ProjectRank.S,
      },
      {
        name: 'Chatwoot',
        description: 'Open-source customer engagement suite, an alternative to Intercom, Zendesk',
        githubRepo: 'https://github.com/chatwoot/chatwoot',
        url: 'https://github.com/chatwoot/chatwoot',
        technologies: ['ruby', 'rails', 'customer-support', 'chat'],
        rank: ProjectRank.A,
      },
    ],
    kumo: [
      {
        name: 'Tauri',
        description: 'Build smaller, faster, and more secure desktop applications with a web frontend',
        githubRepo: 'https://github.com/tauri-apps/tauri',
        url: 'https://github.com/tauri-apps/tauri',
        technologies: ['rust', 'desktop', 'webview', 'gui'],
        rank: ProjectRank.S,
      },
      {
        name: 'Deno',
        description: 'A modern runtime for JavaScript and TypeScript',
        githubRepo: 'https://github.com/denoland/deno',
        url: 'https://github.com/denoland/deno',
        technologies: ['rust', 'javascript', 'typescript', 'runtime'],
        rank: ProjectRank.S,
      },
      {
        name: 'Alacritty',
        description: 'A cross-platform, GPU-accelerated terminal emulator',
        githubRepo: 'https://github.com/alacritty/alacritty',
        url: 'https://github.com/alacritty/alacritty',
        technologies: ['rust', 'terminal', 'gpu', 'emulator'],
        rank: ProjectRank.A,
      },
      {
        name: 'Ripgrep',
        description: 'A line-oriented search tool that recursively searches directories for a regex pattern',
        githubRepo: 'https://github.com/BurntSushi/ripgrep',
        url: 'https://github.com/BurntSushi/ripgrep',
        technologies: ['rust', 'cli', 'search', 'grep'],
        rank: ProjectRank.A,
      },
    ],
    ame: [
      {
        name: 'Laravel',
        description: 'The PHP Framework for Web Artisans',
        githubRepo: 'https://github.com/laravel/laravel',
        url: 'https://github.com/laravel/laravel',
        technologies: ['php', 'laravel', 'framework', 'mvc'],
        rank: ProjectRank.S,
      },
      {
        name: 'Filament',
        description: 'The elegant TALL stack admin panel and form builder for Laravel',
        githubRepo: 'https://github.com/filamentphp/filament',
        url: 'https://github.com/filamentphp/filament',
        technologies: ['php', 'laravel', 'admin-panel', 'ui'],
        rank: ProjectRank.A,
      },
      {
        name: 'Symfony',
        description: 'The Symfony PHP framework',
        githubRepo: 'https://github.com/symfony/symfony',
        url: 'https://github.com/symfony/symfony',
        technologies: ['php', 'symfony', 'framework', 'components'],
        rank: ProjectRank.S,
      },
      {
        name: 'Drupal',
        description: 'Open source content management platform',
        githubRepo: 'https://github.com/drupal/drupal',
        url: 'https://github.com/drupal/drupal',
        technologies: ['php', 'cms', 'content-management', 'drupal'],
        rank: ProjectRank.A,
      },
    ],
  };

  constructor(
    @InjectModel(Community.name)
    private readonly communityModel: Model<CommunityDocument>,
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
    @InjectModel(Project.name)
    private readonly projectModel: Model<ProjectDocument>,
    private readonly githubService: GitHubService
  ) {}

  /**
   * Seed communities into the database
   */
  async seedCommunities(): Promise<SeedingResult> {
    try {
      this.logger.log('Starting community seeding...');

      // Check if communities already exist
      const existingCommunities = await this.communityModel.find({}).select('name').lean().exec();

      if (existingCommunities.length > 0) {
        this.logger.log(`Communities already exist (${existingCommunities.length} found)`);
        for (const community of existingCommunities) {
          this.logger.log(`   - ${community.name}`);
        }
        this.logger.log('Skipping seeding to prevent duplicates.');

        return {
          success: true,
          count: existingCommunities.length,
          message: 'Communities already exist, skipping seeding',
        };
      }

      // Create a temporary ObjectId for kage (required field)
      const tempKageId = new this.communityModel()._id;

      const communitiesToCreate = this.COMMUNITIES_DATA.map((community) => ({
        ...community,
        kage: tempKageId,
        mentors: [],
        members: [],
        projects: [],
      }));

      const createdCommunities = await this.communityModel.insertMany(communitiesToCreate, {
        ordered: false,
      });

      this.logger.log(`Successfully seeded ${createdCommunities.length} communities:`);
      for (const community of createdCommunities) {
        this.logger.log(`   - ${community.name}`);
      }

      return {
        success: true,
        count: createdCommunities.length,
        message: 'Communities seeded successfully',
      };
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'code' in error && error.code === 11000) {
        // Duplicate key error - some communities already exist
        this.logger.warn('Some communities already exist. Checking current state...');
        const existingCommunities = await this.communityModel.find({}).select('name').lean().exec();
        this.logger.log(`Found ${existingCommunities.length} existing communities:`);
        for (const community of existingCommunities) {
          this.logger.log(`   - ${community.name}`);
        }

        return {
          success: true,
          count: existingCommunities.length,
          message: 'Some communities already existed, partial seeding completed',
        };
      }

      this.logger.error('Error seeding communities:', (error as Error).message);
      throw error;
    }
  }

  /**
   * Upsert PHP community (update if exists, create if not)
   */
  async upsertPhpCommunity(): Promise<SeedingResult> {
    try {
      this.logger.log('Starting PHP community upsert...');

      const phpCommunityData = this.COMMUNITIES_DATA.find((c) => c.slug === 'ame');
      if (!phpCommunityData) {
        throw new Error('PHP community data not found in seed data');
      }

      // Check if PHP community already exists
      const existingCommunity = await this.communityModel.findOne({ slug: 'ame' }).lean().exec();
      const wasCreated = !existingCommunity;

      // Get or create a temporary ObjectId for kage (required field)
      const tempKageId = existingCommunity?.kage || new this.communityModel()._id;

      // Upsert: update if exists (by slug), create if not
      const result = await this.communityModel.findOneAndUpdate(
        { slug: 'ame' },
        {
          $set: {
            name: phpCommunityData.name,
            slug: phpCommunityData.slug,
            description: phpCommunityData.description,
            tags: phpCommunityData.tags,
            isActive: phpCommunityData.isActive,
          },
          $setOnInsert: {
            kage: tempKageId,
            mentors: [],
            members: [],
            projects: [],
          },
        },
        {
          upsert: true,
          new: true,
          runValidators: true,
        }
      );

      this.logger.log(
        `PHP community ${wasCreated ? 'created' : 'updated'}: ${result.name} (slug: ${result.slug})`
      );

      return {
        success: true,
        count: 1,
        message: `PHP community ${wasCreated ? 'created' : 'updated'} successfully`,
      };
    } catch (error) {
      this.logger.error('Error upserting PHP community:', (error as Error).message);
      throw error;
    }
  }

  /**
   * Upsert missing communities - checks which communities from seed data are missing and adds them
   */
  async upsertMissingCommunities(): Promise<SeedingResult> {
    try {
      this.logger.log('Checking for missing communities...');

      // Get all existing communities by slug
      const existingCommunities = await this.communityModel
        .find({})
        .select('slug kage')
        .lean()
        .exec();
      const existingSlugs = new Set(existingCommunities.map((c) => c.slug));

      // Find missing communities
      const missingCommunities = this.COMMUNITIES_DATA.filter(
        (community) => !existingSlugs.has(community.slug)
      );

      if (missingCommunities.length === 0) {
        this.logger.log('All communities from seed data already exist. No missing communities.');
        return {
          success: true,
          count: 0,
          message: 'All communities already exist',
        };
      }

      this.logger.log(`Found ${missingCommunities.length} missing community/communities:`);
      for (const community of missingCommunities) {
        this.logger.log(`   - ${community.name} (slug: ${community.slug})`);
      }

      // Upsert each missing community
      let createdCount = 0;
      let updatedCount = 0;

      for (const communityData of missingCommunities) {
        const existingCommunity = existingCommunities.find((c) => c.slug === communityData.slug);
        const wasCreated = !existingCommunity;

        // Get or create a temporary ObjectId for kage (required field)
        const tempKageId = existingCommunity?.kage || new this.communityModel()._id;

        // Upsert: update if exists (by slug), create if not
        const result = await this.communityModel.findOneAndUpdate(
          { slug: communityData.slug },
          {
            $set: {
              name: communityData.name,
              slug: communityData.slug,
              description: communityData.description,
              tags: communityData.tags,
              isActive: communityData.isActive,
            },
            $setOnInsert: {
              kage: tempKageId,
              mentors: [],
              members: [],
              projects: [],
            },
          },
          {
            upsert: true,
            new: true,
            runValidators: true,
          }
        );

        if (wasCreated) {
          createdCount++;
          this.logger.log(`   ✓ Created: ${result.name} (slug: ${result.slug})`);
        } else {
          updatedCount++;
          this.logger.log(`   ✓ Updated: ${result.name} (slug: ${result.slug})`);
        }
      }

      const totalCount = createdCount + updatedCount;
      this.logger.log(
        `Successfully upserted ${totalCount} community/communities (${createdCount} created, ${updatedCount} updated)`
      );

      return {
        success: true,
        count: totalCount,
        message: `Upserted ${totalCount} community/communities (${createdCount} created, ${updatedCount} updated)`,
      };
    } catch (error) {
      this.logger.error('Error upserting missing communities:', (error as Error).message);
      throw error;
    }
  }

  /**
   * Clear all communities from the database
   */
  async clearCommunities(): Promise<SeedingResult> {
    try {
      this.logger.log('🧹 Clearing communities...');
      const result = await this.communityModel.deleteMany({}).exec();
      this.logger.log(`Cleared ${result.deletedCount} communities`);

      return {
        success: true,
        count: result.deletedCount,
        message: 'Communities cleared successfully',
      };
    } catch (error) {
      this.logger.error('Error clearing communities:', (error as Error).message);
      throw error;
    }
  }

  /**
   * Reset communities (clear + seed)
   */
  async resetCommunities(): Promise<SeedingResult> {
    this.logger.log('Resetting communities (clear + seed)...');
    await this.clearCommunities();
    return await this.seedCommunities();
  }

  /**
   * Get database status
   */
  async getDatabaseStatus(): Promise<DatabaseStatus> {
    try {
      const communities = await this.communityModel.find({}).select('name isActive').lean().exec();

      const activeCommunities = communities.filter((c) => c.isActive).length;
      const inactiveCommunities = communities.length - activeCommunities;

      this.logger.log('Database Status:');
      this.logger.log(`   Total Communities: ${communities.length}`);
      this.logger.log(`   Active: ${activeCommunities}`);
      this.logger.log(`   Inactive: ${inactiveCommunities}`);

      if (communities.length > 0) {
        this.logger.log('   Communities:');
        for (const community of communities) {
          const status = community.isActive ? '✅' : '❌';
          this.logger.log(`     ${status} ${community.name}`);
        }
      }

      return {
        totalCommunities: communities.length,
        activeCommunities,
        inactiveCommunities,
        communities: communities.map((c) => ({
          name: c.name,
          isActive: c.isActive,
        })),
      };
    } catch (error) {
      this.logger.error('Error getting database status:', (error as Error).message);
      throw error;
    }
  }

  /**
   * Hash password using bcrypt
   */
  private async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }

  /**
   * Seed admin user into the database
   */
  async seedAdmin(): Promise<SeedingResult> {
    try {
      this.logger.log('Starting admin seeding...');

      const adminEmail = envConfig.admin.email;
      const adminPassword = envConfig.admin.password;

      // Check if admin already exists
      const existingAdmin = await this.userModel.findOne({ email: adminEmail }).lean().exec();

      if (existingAdmin) {
        this.logger.log('Skipping seeding to prevent duplicates.');

        return {
          success: true,
          count: 1,
          message: 'Admin already exists, skipping seeding',
        };
      }

      // Hash the password
      const hashedPassword = await this.hashPassword(adminPassword);

      // Create admin user
      const admin = await this.userModel.create({
        name: 'Platform Admin',
        email: adminEmail,
        password: hashedPassword,
        role: UserRole.KAGE,
        status: UserStatus.ACTIVE,
        isActive: true,
        bio: 'Platform Administrator',
        skills: ['Platform Management', 'User Administration'],
        interests: ['Open Source', 'Community Building'],
      });

      this.logger.log(`Successfully seeded admin user: ${admin.email}`);
      this.logger.log(`   Role: ${admin.role}`);
      this.logger.log(`   Status: ${admin.status}`);

      return {
        success: true,
        count: 1,
        message: 'Admin user seeded successfully',
      };
    } catch (error) {
      this.logger.error('Error seeding admin:', (error as Error).message);
      throw error;
    }
  }

  /**
   * Clear admin user from the database
   */
  async clearAdmin(): Promise<SeedingResult> {
    try {
      this.logger.log('🧹 Clearing admin user...');
      const adminEmail = envConfig.admin.email;
      const result = await this.userModel.deleteOne({ email: adminEmail }).exec();
      this.logger.log(`Cleared ${result.deletedCount} admin user(s)`);

      return {
        success: true,
        count: result.deletedCount,
        message: 'Admin user cleared successfully',
      };
    } catch (error) {
      this.logger.error('Error clearing admin:', (error as Error).message);
      throw error;
    }
  }

  /**
   * Reset admin user (clear + seed)
   */
  async resetAdmin(): Promise<SeedingResult> {
    this.logger.log('Resetting admin user (clear + seed)...');
    await this.clearAdmin();
    return await this.seedAdmin();
  }

  /**
   * Seed projects for all communities
   */
  async seedProjects(): Promise<SeedingResult> {
    try {
      this.logger.log('Starting project seeding...');

      // Get all active communities
      const communities = await this.communityModel.find({ isActive: true }).lean().exec();

      if (communities.length === 0) {
        this.logger.warn('No active communities found. Please seed communities first.');
        return {
          success: false,
          count: 0,
          message: 'No active communities found',
        };
      }

      let totalCreated = 0;
      let totalSkipped = 0;

      for (const community of communities) {
        const slug = community.slug as keyof typeof this.PROJECTS_DATA;
        const projectsData = this.PROJECTS_DATA[slug];

        if (!projectsData) {
          this.logger.warn(`No project data found for community: ${community.name} (slug: ${slug})`);
          continue;
        }

        // Check existing projects for this community
        const existingProjects = await this.projectModel
          .find({ community: community._id })
          .select('name')
          .lean()
          .exec();

        if (existingProjects.length > 0) {
          this.logger.log(
            `Community "${community.name}" already has ${existingProjects.length} project(s). Checking for missing projects...`
          );
        }

        // Get or create a temporary owner (use community kage if available, otherwise create temp ID)
        const tempOwnerId = community.kage || new this.projectModel()._id;

        // Upsert each project for this community
        for (const projectData of projectsData) {
          const existingProject = await this.projectModel
            .findOne({
              community: community._id,
              name: projectData.name,
            })
            .lean()
            .exec();

          if (existingProject) {
            // Update existing project metadata (stats will be fetched at runtime)
            await this.projectModel.updateOne(
              { _id: existingProject._id },
              {
                $set: {
                  description: projectData.description,
                  rank: projectData.rank,
                  githubRepo: projectData.githubRepo,
                  url: projectData.githubRepo,
                  website: projectData.url || projectData.githubRepo,
                  technologies: projectData.technologies,
                },
              }
            );
            totalSkipped++;
            this.logger.log(`   ↻ Updated metadata for existing project: ${projectData.name}`);
            continue;
          }

          await this.projectModel.create({
            name: projectData.name,
            description: projectData.description,
            rank: projectData.rank,
            status: ProjectStatus.CREATED,
            owner: tempOwnerId,
            members: [],
            community: community._id,
            githubRepo: projectData.githubRepo,
            url: projectData.githubRepo, // Keep GitHub URL in url field
            website: projectData.url || projectData.githubRepo,
            stars: 0, // Stats will be fetched at runtime
            contributors: 0, // Stats will be fetched at runtime
            lastUpdated: new Date(),
            technologies: projectData.technologies,
          });

          totalCreated++;
          this.logger.log(`   ✓ Created project: ${projectData.name} for ${community.name}`);
        }

        // Update community's projects array
        const communityProjects = await this.projectModel
          .find({ community: community._id })
          .select('_id')
          .lean()
          .exec();

        await this.communityModel.updateOne(
          { _id: community._id },
          { $set: { projects: communityProjects.map((p) => p._id) } }
        );
      }

      this.logger.log(
        `Successfully seeded projects: ${totalCreated} created, ${totalSkipped} skipped (already exist)`
      );

      return {
        success: true,
        count: totalCreated,
        message: `Seeded ${totalCreated} projects (${totalSkipped} already existed)`,
      };
    } catch (error) {
      this.logger.error('Error seeding projects:', (error as Error).message);
      throw error;
    }
  }

  /**
   * Upsert missing projects - checks which projects from seed data are missing and adds them
   */
  async upsertMissingProjects(): Promise<SeedingResult> {
    try {
      this.logger.log('Checking for missing projects...');

      // Get all active communities
      const communities = await this.communityModel.find({ isActive: true }).lean().exec();

      if (communities.length === 0) {
        this.logger.warn('No active communities found.');
        return {
          success: true,
          count: 0,
          message: 'No active communities found',
        };
      }

      let totalCreated = 0;
      let totalUpdated = 0;

      for (const community of communities) {
        const slug = community.slug as keyof typeof this.PROJECTS_DATA;
        const projectsData = this.PROJECTS_DATA[slug];

        if (!projectsData) {
          continue;
        }

        // Get existing projects for this community
        const existingProjects = await this.projectModel
          .find({ community: community._id })
          .select('name')
          .lean()
          .exec();
        const existingProjectNames = new Set(existingProjects.map((p) => p.name));

        // Find missing projects
        const missingProjects = projectsData.filter((p) => !existingProjectNames.has(p.name));

        if (missingProjects.length === 0) {
          continue;
        }

        this.logger.log(`Found ${missingProjects.length} missing project(s) for ${community.name}:`);
        for (const project of missingProjects) {
          this.logger.log(`   - ${project.name}`);
        }

        // Get or create a temporary owner
        const tempOwnerId = community.kage || new this.projectModel()._id;

        // Upsert each missing project
        for (const projectData of missingProjects) {
          const existingProject = await this.projectModel
            .findOne({
              community: community._id,
              name: projectData.name,
            })
            .lean()
            .exec();

          const wasCreated = !existingProject;

          if (wasCreated) {
            await this.projectModel.create({
              name: projectData.name,
              description: projectData.description,
              rank: projectData.rank,
              status: ProjectStatus.CREATED,
              owner: tempOwnerId,
              members: [],
              community: community._id,
              githubRepo: projectData.githubRepo,
              url: projectData.githubRepo, // Keep GitHub URL in url field
              website: projectData.url || projectData.githubRepo,
              stars: 0, // Stats will be fetched at runtime
              contributors: 0, // Stats will be fetched at runtime
              lastUpdated: new Date(),
              technologies: projectData.technologies,
            });
            totalCreated++;
            this.logger.log(`   ✓ Created: ${projectData.name}`);
          } else {
            // Update existing project metadata (stats will be fetched at runtime)
            await this.projectModel.updateOne(
              { _id: existingProject._id },
              {
                $set: {
                  description: projectData.description,
                  rank: projectData.rank,
                  githubRepo: projectData.githubRepo,
                  url: projectData.githubRepo, // Keep GitHub URL in url field
                  website: projectData.url || projectData.githubRepo,
                  technologies: projectData.technologies,
                },
              }
            );
            totalUpdated++;
            this.logger.log(`   ✓ Updated metadata: ${projectData.name}`);
          }
        }

        // Update community's projects array
        const communityProjects = await this.projectModel
          .find({ community: community._id })
          .select('_id')
          .lean()
          .exec();

        await this.communityModel.updateOne(
          { _id: community._id },
          { $set: { projects: communityProjects.map((p) => p._id) } }
        );
      }

      const totalCount = totalCreated + totalUpdated;
      if (totalCount === 0) {
        this.logger.log('All projects from seed data already exist. No missing projects.');
      } else {
        this.logger.log(
          `Successfully upserted ${totalCount} project(s) (${totalCreated} created, ${totalUpdated} updated)`
        );
      }

      return {
        success: true,
        count: totalCount,
        message: `Upserted ${totalCount} project(s) (${totalCreated} created, ${totalUpdated} updated)`,
      };
    } catch (error) {
      this.logger.error('Error upserting missing projects:', (error as Error).message);
      throw error;
    }
  }

  /**
   * Refresh GitHub stats for all existing projects
   */
  async refreshProjectStats(): Promise<SeedingResult> {
    try {
      this.logger.log('Refreshing GitHub stats for all projects...');

      const projects = await this.projectModel.find({ githubRepo: { $exists: true, $ne: null } }).lean().exec();

      if (projects.length === 0) {
        this.logger.log('No projects with GitHub repositories found.');
        return {
          success: true,
          count: 0,
          message: 'No projects to refresh',
        };
      }

      let updated = 0;
      let failed = 0;

      for (const project of projects) {
        if (!project.githubRepo) {
          continue;
        }

        try {
          const githubStats = await this.githubService.fetchRepositoryStats(project.githubRepo);
          // Add delay to avoid rate limiting
          await new Promise((resolve) => setTimeout(resolve, 500));

          if (githubStats) {
            await this.projectModel.updateOne(
              { _id: project._id },
              {
                $set: {
                  stars: githubStats.stars,
                  contributors: githubStats.contributors,
                  lastUpdated: githubStats.lastUpdated,
                  website: githubStats.website || project.website || project.githubRepo,
                },
              }
            );
            updated++;
            this.logger.log(
              `   ↻ Refreshed: ${project.name} (${githubStats.stars} stars, ${githubStats.contributors} contributors)`
            );
          } else {
            failed++;
            this.logger.warn(`   ✗ Failed to fetch stats for: ${project.name}`);
          }
        } catch (error) {
          failed++;
          this.logger.error(`Error refreshing stats for ${project.name}:`, (error as Error).message);
        }
      }

      this.logger.log(`Successfully refreshed ${updated} project(s)${failed > 0 ? `, ${failed} failed` : ''}`);

      return {
        success: true,
        count: updated,
        message: `Refreshed stats for ${updated} project(s)${failed > 0 ? `, ${failed} failed` : ''}`,
      };
    } catch (error) {
      this.logger.error('Error refreshing project stats:', (error as Error).message);
      throw error;
    }
  }
}
