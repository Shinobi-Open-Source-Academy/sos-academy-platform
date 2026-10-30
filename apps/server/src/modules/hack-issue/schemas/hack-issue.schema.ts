import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HackIssueStatus } from '@sos-academy/shared';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { HackIssueEvent } from '../hack-issue-status-machine';

export type HackIssueDocument = HackIssue & Document;

/**
 * One row of an issue's status history, written by every transition
 */
@Schema({ _id: false })
export class HackIssueStatusChange {
  @Prop({ type: String, enum: HackIssueStatus, required: true })
  from: HackIssueStatus;

  @Prop({ type: String, enum: HackIssueStatus, required: true })
  to: HackIssueStatus;

  @Prop({ type: String, enum: HackIssueEvent, required: true })
  event: HackIssueEvent;

  /** User who triggered it; empty for automatic changes (GitHub sync, staleness job) */
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: false })
  actor?: MongooseSchema.Types.ObjectId;

  @Prop()
  reason?: string;

  @Prop({ required: true })
  at: Date;
}

export const HackIssueStatusChangeSchema = SchemaFactory.createForClass(HackIssueStatusChange);

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

  /** Hacker working on the issue, set when it is claimed and cleared when it is released */
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'User',
    required: false,
  })
  assignee?: MongooseSchema.Types.ObjectId;

  @Prop()
  assignedAt?: Date;

  /** Every status change, oldest first (see `HackIssueService.transition`) */
  @Prop({ type: [HackIssueStatusChangeSchema], default: [] })
  statusHistory: HackIssueStatusChange[];
}

export const HackIssueSchema = SchemaFactory.createForClass(HackIssue);

// Add compound indexes for fast lookups
HackIssueSchema.index({ repository: 1, number: 1 }, { unique: true });
HackIssueSchema.index({ status: 1, createdAt: -1 });
HackIssueSchema.index({ language: 1 });
HackIssueSchema.index({ assignee: 1, status: 1 });
