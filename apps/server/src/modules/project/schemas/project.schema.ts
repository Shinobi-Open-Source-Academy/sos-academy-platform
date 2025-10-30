import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ProjectRank, ProjectStatus } from '@sos-academy/shared';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type ProjectDocument = Project & Document;

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
export class Project {
  @Prop({ required: true })
  name: string;

  @Prop()
  description: string;

  @Prop({
    type: String,
    enum: ProjectRank,
    required: true,
  })
  rank: ProjectRank;

  @Prop({
    type: String,
    enum: ProjectStatus,
    default: ProjectStatus.CREATED,
  })
  status: ProjectStatus;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'User',
    required: true,
  })
  owner: MongooseSchema.Types.ObjectId;

  @Prop({
    type: [{ type: MongooseSchema.Types.ObjectId, ref: 'User' }],
    default: [],
  })
  members: MongooseSchema.Types.ObjectId[];

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'Community',
    required: true,
  })
  community: MongooseSchema.Types.ObjectId;

  @Prop()
  startDate: Date;

  @Prop()
  endDate: Date;

  @Prop()
  githubRepo: string;

  @Prop({ default: [] })
  technologies: string[];

  @Prop()
  thumbnail: string;
}

export const ProjectSchema = SchemaFactory.createForClass(Project);

// Add indexes for performance
ProjectSchema.index({ community: 1, status: 1 });
ProjectSchema.index({ owner: 1 });
ProjectSchema.index({ rank: 1, status: 1 });
ProjectSchema.index({ status: 1 });
ProjectSchema.index({ technologies: 1 });
ProjectSchema.index({ createdAt: -1 });
ProjectSchema.index({ startDate: 1, endDate: 1 });
