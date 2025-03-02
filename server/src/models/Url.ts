import mongoose, { Document, Schema } from 'mongoose';

export interface IUrl extends Document {
  originalUrl: string;
  shortUrl: string;
  customAlias?: string;
  createdAt: Date;
  expiresAt?: Date;
  clicks: number;
  isActive: boolean;
  clickHistory: {
    timestamp: Date;
    referrer?: string;
    userAgent?: string;
    ip?: string;
  }[];
}

const urlSchema = new Schema<IUrl>({
  originalUrl: {
    type: String,
    required: true,
  },
  shortUrl: {
    type: String,
    required: true,
    unique: true,
  },
  customAlias: {
    type: String,
    sparse: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  expiresAt: {
    type: Date,
    default: null,
  },
  clicks: {
    type: Number,
    default: 0,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  clickHistory: [
    {
      timestamp: {
        type: Date,
        default: Date.now,
      },
      referrer: String,
      userAgent: String,
      ip: String,
    },
  ],
});

export default mongoose.model<IUrl>('Url', urlSchema);
