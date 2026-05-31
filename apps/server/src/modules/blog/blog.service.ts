import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../user/schemas/user.schema';
import { CreatePostDto } from './dto/create-post.dto';
import { ReactDto } from './dto/react.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { Post, PostDocument } from './schemas/post.schema';

export type SortBy = 'newest' | 'oldest' | 'most_read' | 'most_reacted';
export type DateRange = 'week' | 'month' | 'year';

@Injectable()
export class BlogService {
  private readonly logger = new Logger(BlogService.name);

  private static readonly AUTHOR_POPULATE = {
    path: 'author',
    select: 'name profilePicture githubProfile.login githubProfile.htmlUrl githubProfile.avatarUrl',
  };

  constructor(
    @InjectModel(Post.name) private readonly postModel: Model<PostDocument>,
    @InjectModel(User.name) private readonly userModel: Model<User>
  ) {}

  private generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }

  private calculateReadingTime(content: string): number {
    const wordCount = content.trim().split(/\s+/).length;
    return Math.max(1, Math.ceil(wordCount / 200));
  }

  private generateExcerpt(content: string, maxLength = 200): string {
    const plain = content
      .replace(/```[\s\S]*?```/g, '')
      .replace(/`[^`]+`/g, '')
      .replace(/#+\s/g, '')
      .replace(/\*\*([^*]+)\*\*/g, '$1')
      .replace(/\*([^*]+)\*/g, '$1')
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      .replace(/>\s.+/g, '')
      .replace(/\n+/g, ' ')
      .trim();
    return plain.length > maxLength ? `${plain.slice(0, maxLength)}...` : plain;
  }

  private async ensureUniqueSlug(slug: string, excludeId?: string): Promise<string> {
    let candidate = slug;
    let counter = 1;
    while (true) {
      const filter: Record<string, unknown> = { slug: candidate };
      if (excludeId) filter._id = { $ne: excludeId };
      const existing = await this.postModel.findOne(filter).lean().exec();
      if (!existing) return candidate;
      candidate = `${slug}-${counter}`;
      counter++;
    }
  }

  async create(dto: CreatePostDto): Promise<Post> {
    const baseSlug = this.generateSlug(dto.title);
    const slug = await this.ensureUniqueSlug(baseSlug);
    const readingTime = this.calculateReadingTime(dto.content);
    const excerpt = dto.excerpt || this.generateExcerpt(dto.content);

    const post = new this.postModel({
      title: dto.title,
      content: dto.content,
      excerpt,
      coverImage: dto.coverImage,
      author: dto.authorId,
      slug,
      readingTime,
      tags: dto.tags ?? [],
      featured: dto.featured ?? false,
      published: dto.published ?? false,
      publishedAt: dto.published ? new Date() : undefined,
      views: 0,
      reactions: { heart: 0, fire: 0, rocket: 0, clap: 0, mind_blown: 0 },
      totalReactions: 0,
    });

    const saved = await post.save();
    this.logger.log(`Created blog post: ${saved.slug}`);
    return (await saved.populate(BlogService.AUTHOR_POPULATE)) as Post;
  }

  async findAll(query: {
    page?: number;
    limit?: number;
    search?: string;
    tag?: string;
    featured?: boolean;
    published?: boolean;
    sortBy?: SortBy;
    dateRange?: DateRange;
  }): Promise<{ posts: Post[]; total: number; page: number; pages: number }> {
    const {
      page = 1,
      limit = 10,
      search,
      tag,
      featured,
      published,
      sortBy = 'newest',
      dateRange,
    } = query;

    const filter: Record<string, unknown> = {};

    if (published !== undefined) filter.published = published;
    if (featured !== undefined) filter.featured = featured;
    if (tag) filter.tags = tag;
    if (search) {
      const matchingUsers = await this.userModel
        .find({
          $or: [
            { name: { $regex: search, $options: 'i' } },
            { 'githubProfile.login': { $regex: search, $options: 'i' } },
          ],
        })
        .select('_id')
        .lean()
        .exec();

      const authorIds = matchingUsers.map((u) => u._id);

      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { excerpt: { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } },
        ...(authorIds.length ? [{ author: { $in: authorIds } }] : []),
      ];
    }

    if (dateRange) {
      const now = new Date();
      const msPerDay = 24 * 60 * 60 * 1000;
      const days = dateRange === 'week' ? 7 : dateRange === 'month' ? 30 : 365;
      filter.publishedAt = { $gte: new Date(now.getTime() - days * msPerDay) };
    }

    const sortMap: Record<SortBy, Record<string, 1 | -1>> = {
      newest: { publishedAt: -1, createdAt: -1 },
      oldest: { publishedAt: 1, createdAt: 1 },
      most_read: { views: -1, publishedAt: -1 },
      most_reacted: { totalReactions: -1, publishedAt: -1 },
    };

    const [posts, total] = await Promise.all([
      this.postModel
        .find(filter)
        .sort(sortMap[sortBy])
        .skip((page - 1) * limit)
        .limit(limit)
        .select('-content')
        .populate(BlogService.AUTHOR_POPULATE)
        .lean()
        .exec(),
      this.postModel.countDocuments(filter).exec(),
    ]);

    return { posts, total, page, pages: Math.ceil(total / limit) };
  }

  async findBySlug(slug: string): Promise<Post> {
    const post = await this.postModel
      .findOne({ slug })
      .populate(BlogService.AUTHOR_POPULATE)
      .lean()
      .exec();
    if (!post) throw new NotFoundException(`Post "${slug}" not found`);
    return post;
  }

  async findById(id: string): Promise<Post> {
    const post = await this.postModel
      .findById(id)
      .populate(BlogService.AUTHOR_POPULATE)
      .lean()
      .exec();
    if (!post) throw new NotFoundException(`Post not found`);
    return post;
  }

  async update(id: string, dto: UpdatePostDto): Promise<Post> {
    const existing = await this.postModel.findById(id).exec();
    if (!existing) throw new NotFoundException(`Post not found`);

    const { authorId, ...rest } = dto;
    const updates: Record<string, unknown> = { ...rest };
    if (authorId) updates.author = authorId;

    if (dto.title && dto.title !== existing.title) {
      const baseSlug = this.generateSlug(dto.title);
      updates.slug = await this.ensureUniqueSlug(baseSlug, id);
    }

    if (dto.content) {
      updates.readingTime = this.calculateReadingTime(dto.content);
      if (!dto.excerpt) updates.excerpt = this.generateExcerpt(dto.content);
    }

    if (dto.published === true && !existing.published) {
      updates.publishedAt = new Date();
    }

    const updated = await this.postModel
      .findByIdAndUpdate(id, { $set: updates }, { new: true })
      .populate(BlogService.AUTHOR_POPULATE)
      .lean()
      .exec();

    this.logger.log(`Updated blog post: ${updated?.slug}`);
    return updated!;
  }

  async remove(id: string): Promise<void> {
    const result = await this.postModel.findByIdAndDelete(id).exec();
    if (!result) throw new NotFoundException(`Post not found`);
    this.logger.log(`Deleted blog post: ${result.slug}`);
  }

  async getTags(): Promise<string[]> {
    const tags = await this.postModel.distinct('tags', { published: true }).exec();
    return (tags as string[]).sort();
  }

  async trackView(slug: string): Promise<void> {
    await this.postModel.findOneAndUpdate({ slug, published: true }, { $inc: { views: 1 } }).exec();
  }

  async react(
    slug: string,
    dto: ReactDto
  ): Promise<{ reactions: Post['reactions']; totalReactions: number }> {
    const update = {
      $inc: {
        [`reactions.${dto.type}`]: 1,
        totalReactions: 1,
      },
    };

    const updated = await this.postModel
      .findOneAndUpdate({ slug, published: true }, update, { new: true })
      .select('reactions totalReactions')
      .lean()
      .exec();

    if (!updated) throw new NotFoundException(`Post "${slug}" not found`);

    return {
      reactions: updated.reactions,
      totalReactions: updated.totalReactions,
    };
  }

  async getReactions(
    slug: string
  ): Promise<{ reactions: Post['reactions']; totalReactions: number }> {
    const post = await this.postModel
      .findOne({ slug })
      .select('reactions totalReactions')
      .lean()
      .exec();

    if (!post) throw new NotFoundException(`Post "${slug}" not found`);

    return {
      reactions: post.reactions,
      totalReactions: post.totalReactions,
    };
  }
}
