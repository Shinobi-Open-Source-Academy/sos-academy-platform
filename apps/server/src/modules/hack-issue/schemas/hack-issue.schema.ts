import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HackIssueStatus } from '@sos-academy/shared';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type HackIssueDocument = HackIssue & Document;

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
export class HackIssue {
  @Prop({ required: true })
  githubId: number;

  /**
   * Lowercased `owner/repo`, used to detect duplicates regardless of URL casing
   */
  @Prop({ required: true, lowercase: true, trim: true })
  repository: string;

  @Prop({ required: true })
  owner: string;

  @Prop({ required: true })
  repo: string;

  @Prop({ required: true })
  number: number;

  @Prop({ required: true })
  title: string;

  @Prop()
  body?: string;

  @Prop({ type: [String], default: [] })
  labels: string[];

  /**
   * Primary language of the repository, used for leaderboard filtering
   */
  @Prop()
  language?: string;

  @Prop({ required: true })
  url: string;

  @Prop({
    type: String,
    enum: HackIssueStatus,
    default: HackIssueStatus.OPEN,
  })
  status: HackIssueStatus;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'User',
    required: false,
  })
  registeredBy?: MongooseSchema.Types.ObjectId;
}

export const HackIssueSchema = SchemaFactory.createForClass(HackIssue);

// Add compound indexes for fast lookups
HackIssueSchema.index({ repository: 1, number: 1 }, { unique: true });
HackIssueSchema.index({ status: 1, createdAt: -1 });
HackIssueSchema.index({ language: 1 });
