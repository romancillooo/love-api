import { Schema, model, Document } from 'mongoose';

export interface LetterDocument extends Document {
  title: string;
  icon: string;
  content: string;
  publishedAt?: Date;
  legacyId?: number;
  createdAt: Date;
  updatedAt: Date;
}

const letterSchema = new Schema<LetterDocument>(
  {
    title: { type: String, required: true, trim: true },
    icon: { type: String, required: true, trim: true },
    content: { type: String, required: true },
    publishedAt: { type: Date },
    legacyId: { type: Number, unique: true, sparse: true }
  },
  {
    timestamps: true,
    collection: 'letters'
  }
);

letterSchema.index({ publishedAt: -1 });
letterSchema.index({ title: 'text', content: 'text' });

export const LetterModel = model<LetterDocument>('Letter', letterSchema);

