// src/models/appModels/Letter.ts
import { Schema, model } from 'mongoose';

const LetterSchema = new Schema({
  id: { type: Number, unique: true, sparse: true },
  title: { type: String, required: true },
  icon: { type: String, required: true },
  content: { type: String, required: true },
  publishedAt: { type: Date },
  createdAt: { type: Date, default: Date.now },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
});

// Índices para mejorar las consultas
LetterSchema.index({ createdAt: -1 });
LetterSchema.index({ publishedAt: -1 });

export const Letter = model('Letter', LetterSchema);
