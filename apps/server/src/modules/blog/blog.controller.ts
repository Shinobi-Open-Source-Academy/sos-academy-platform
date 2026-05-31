import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ApiOperation, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { BlogService } from './blog.service';
import { CreatePostDto } from './dto/create-post.dto';
import { ReactDto } from './dto/react.dto';
import { UpdatePostDto } from './dto/update-post.dto';

@ApiTags('Blog')
@Controller('blog')
export class BlogController {
  constructor(private readonly blogService: BlogService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new blog post' })
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async create(@Body() dto: CreatePostDto) {
    return this.blogService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List blog posts' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'tag', required: false, type: String })
  @ApiQuery({ name: 'featured', required: false, type: Boolean })
  @ApiQuery({ name: 'published', required: false, type: Boolean })
  @ApiQuery({
    name: 'sortBy',
    required: false,
    enum: ['newest', 'oldest', 'most_read', 'most_reacted'],
  })
  @ApiQuery({ name: 'dateRange', required: false, enum: ['week', 'month', 'year'] })
  async findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('tag') tag?: string,
    @Query('featured') featured?: string,
    @Query('published') published?: string,
    @Query('sortBy') sortBy?: string,
    @Query('dateRange') dateRange?: string
  ) {
    return this.blogService.findAll({
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
      search,
      tag,
      featured: featured !== undefined ? featured === 'true' : undefined,
      published: published !== undefined ? published === 'true' : undefined,
      sortBy: sortBy as 'newest' | 'oldest' | 'most_read' | 'most_reacted' | undefined,
      dateRange: dateRange as 'week' | 'month' | 'year' | undefined,
    });
  }

  @Get('tags')
  @ApiOperation({ summary: 'List all published post tags' })
  async getTags() {
    return this.blogService.getTags();
  }

  @Get(':slug')
  @ApiOperation({ summary: 'Get a post by slug' })
  @ApiParam({ name: 'slug', description: 'Post slug' })
  async findBySlug(@Param('slug') slug: string) {
    return this.blogService.findBySlug(slug);
  }

  @Post(':slug/view')
  @ApiOperation({ summary: 'Track a view for a post' })
  @ApiParam({ name: 'slug', description: 'Post slug' })
  async trackView(@Param('slug') slug: string) {
    await this.blogService.trackView(slug);
    return { ok: true };
  }

  @Get(':slug/reactions')
  @ApiOperation({ summary: 'Get reactions for a post' })
  @ApiParam({ name: 'slug', description: 'Post slug' })
  async getReactions(@Param('slug') slug: string) {
    return this.blogService.getReactions(slug);
  }

  @Post(':slug/react')
  @ApiOperation({ summary: 'React to a post' })
  @ApiParam({ name: 'slug', description: 'Post slug' })
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async react(@Param('slug') slug: string, @Body() dto: ReactDto) {
    return this.blogService.react(slug, dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a blog post' })
  @ApiParam({ name: 'id', description: 'Post ID' })
  @UsePipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      skipMissingProperties: true,
      skipNullProperties: true,
      skipUndefinedProperties: true,
    })
  )
  async update(@Param('id') id: string, @Body() dto: UpdatePostDto) {
    return this.blogService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a blog post' })
  @ApiParam({ name: 'id', description: 'Post ID' })
  async remove(@Param('id') id: string) {
    await this.blogService.remove(id);
    return { message: 'Post deleted successfully' };
  }
}
