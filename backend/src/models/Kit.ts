import mongoose, { Document, Schema } from 'mongoose';
import { ManagedKit, RegenerationStates } from '../types/schemas';

export interface IKitDoc extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  status: 'generating' | 'completed' | 'failed';
  kitData?: ManagedKit;
  error?: string;
  job_description?: string;
  company_url?: string;
  role_name?: string;
  study_days?: number;
  raw_context?: string;
  regeneration_states?: RegenerationStates;
  createdAt: Date;
  updatedAt: Date;
}

const MetadataSchema = new Schema({
  origin: { type: String, enum: ['generated', 'manual', 'regenerated'], required: true },
  is_pinned: { type: Boolean, default: false },
  is_edited: { type: Boolean, default: false },
  user_modified_at: { type: String, default: null }
}, { _id: false });

const KitSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  title: { type: String, required: true },
  status: { type: String, enum: ['generating', 'completed', 'failed'], default: 'generating' },
  error: { type: String },
  job_description: { type: String },
  company_url: { type: String },
  role_name: { type: String },
  study_days: { type: Number },
  raw_context: { type: String },
  kitData: { type: Schema.Types.Mixed }, // Use Mixed for the heavily nested Appendix A schema
  regeneration_states: { type: Schema.Types.Mixed },
}, { timestamps: true });

export const KitModel = mongoose.model<IKitDoc>('Kit', KitSchema);
