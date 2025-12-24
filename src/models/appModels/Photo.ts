// src/models/appModels/Photo.ts
import { Schema, model } from 'mongoose';

const PhotoSchema = new Schema({
  url: { type: String, required: true },
  format: { type: String, default: 'webp' },
  folder: { type: String },
  createdAt: { type: Date, default: Date.now },
  originalName: { type: String },
  size: { type: Number },
  isFavorite: { type: Boolean, default: false },
  uploadedBy: { type: Schema.Types.ObjectId, ref: 'User' },
});

export const Photo = model('Photo', PhotoSchema);
