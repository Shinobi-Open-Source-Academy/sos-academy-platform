import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from '../user/schemas/user.schema';
import { BlogController } from './blog.controller';
import { BlogService } from './blog.service';
import { ImageUploadService } from './image-upload.service';
import { Post, PostSchema } from './schemas/post.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Post.name, schema: PostSchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  controllers: [BlogController],
  providers: [BlogService, ImageUploadService],
  exports: [BlogService],
})
export class BlogModule {}
