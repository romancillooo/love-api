import { Schema, model, Document } from 'mongoose';

export interface PhotoDocument extends Document {
  title?: string;
  description: string;
  smallUrl: string;
  largeUrl: string;
  capturedAt: Date;
  tags: string[];
  location?: string;
  legacyId?: number;
  isFavorite: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const photoSchema = new Schema<PhotoDocument>(
  {
    title: { type: String, trim: true },
    description: { type: String, required: true, trim: true },
    smallUrl: { type: String, required: true },
    largeUrl: { type: String, required: true },
    capturedAt: { type: Date, required: true },
    tags: { type: [String], default: [] },
    location: { type: String, trim: true },
    legacyId: { type: Number, unique: true, sparse: true },
    isFavorite: { type: Boolean, default: false }
  },
  {
    timestamps: true,
    collection: 'photos'
  }
);

photoSchema.index({ capturedAt: -1 });
photoSchema.index({ tags: 1 });
photoSchema.index({ isFavorite: 1 });

export const PhotoModel = model<PhotoDocument>('Photo', photoSchema);


