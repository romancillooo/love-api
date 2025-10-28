// src/models/appModels/Album.ts
import { Schema, model } from 'mongoose';

const AlbumSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 50 },
    description: { type: String, trim: true, maxlength: 200, default: '' },
    coverPhotoUrl: { type: String, trim: true },
    photoIds: [{ type: Schema.Types.ObjectId, ref: 'Photo' }],
    photoCount: { type: Number, default: 0 },
  },
  { timestamps: true },
);

AlbumSchema.index({ createdAt: -1 });
AlbumSchema.index({ name: 1 });

export const Album = model('Album', AlbumSchema);
