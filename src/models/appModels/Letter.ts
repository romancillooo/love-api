// src/models/appModels/Letter.ts
import { Schema, model } from 'mongoose';

// 💝 Schema embebido para reacciones
const ReactionSchema = new Schema({
  emoji: { 
    type: String, 
    required: true
  },
  user: { 
    type: Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
}, { _id: false }); // No necesitamos _id para las reacciones embebidas

const LetterSchema = new Schema({
  id: { type: Number, unique: true, sparse: true },
  title: { type: String, required: true },
  icon: { type: String, required: true },
  content: { type: String, required: true },
  publishedAt: { type: Date },
  createdAt: { type: Date, default: Date.now },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  reactions: [ReactionSchema] // 💕 Array de reacciones (máximo una por usuario)
});

// Índices para mejorar las consultas
LetterSchema.index({ createdAt: -1 });
LetterSchema.index({ publishedAt: -1 });

export const Letter = model('Letter', LetterSchema);
