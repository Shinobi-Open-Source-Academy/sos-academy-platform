import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type PostDocument = Post & Document;

@Schema({
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: (_, ret) => {
      ret.__v = undefined;
      return ret;
    },
  },
})
export class Post {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true, unique: true })
  slug: string;

  @Prop({ required: true })
  content: string;

  @Prop({ required: false })
  excerpt?: string;

  @Prop({ required: false })
  coverImage?: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  author: MongooseSchema.Types.ObjectId;

  @Prop({ type: [String], default: [] })
  tags: string[];

  @Prop({ default: false })
  featured: boolean;

  @Prop({ default: false })
  published: boolean;

  @Prop({ type: Date })
  publishedAt?: Date;

  @Prop({ default: 1 })
  readingTime: number;

  @Prop({ default: 0 })
  views: number;

  @Prop({
    type: {
      heart: { type: Number, default: 0 },
      fire: { type: Number, default: 0 },
      rocket: { type: Number, default: 0 },
      clap: { type: Number, default: 0 },
      mind_blown: { type: Number, default: 0 },
    },
    default: () => ({ heart: 0, fire: 0, rocket: 0, clap: 0, mind_blown: 0 }),
    _id: false,
  })
  reactions: {
    heart: number;
    fire: number;
    rocket: number;
    clap: number;
    mind_blown: number;
  };

  @Prop({ default: 0 })
  totalReactions: number;
}

export const PostSchema = SchemaFactory.createForClass(Post);
PostSchema.index({ published: 1, publishedAt: -1 });
PostSchema.index({ tags: 1 });
PostSchema.index({ featured: 1 });
