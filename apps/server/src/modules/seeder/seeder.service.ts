import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { UserRole, UserStatus } from '@sos-academy/shared';
import * as bcrypt from 'bcrypt';
import { Model } from 'mongoose';
import { envConfig } from '../../common/config/env.config';
import { Community, CommunityDocument } from '../community/schemas/community.schema';
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
      slug: 'suna',
      description:
        'Master modern JavaScript and its frameworks while contributing to web-focused open-source projects.',
      tags: ['javascript', 'web', 'frontend', 'nodejs', 'react', 'vue'],
      isActive: true,
    },
    {
      name: 'Python',
      slug: 'konoha',
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
      slug: 'rust',
      description:
        'Build memory-safe, high-performance systems and contribute to cutting-edge Rust projects.',
      tags: ['rust', 'systems', 'performance', 'memory-safe', 'backend', 'blockchain'],
      isActive: true,
    },
  ];

  constructor(
    @InjectModel(Community.name)
    private readonly communityModel: Model<CommunityDocument>,
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>
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
        this.logger.log(`Admin already exists: ${adminEmail}`);
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
}
