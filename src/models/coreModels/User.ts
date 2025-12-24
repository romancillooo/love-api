// src/models/coreModels/User.ts
import { Schema, model, Document } from 'mongoose';

export type UserRole = 'superadmin' | 'admin' | 'user';

export interface UserDocument extends Document {
  email: string;
  username: string;
  displayName: string;
  passwordHash: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<UserDocument>(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    username: { type: String, required: true, unique: true, lowercase: true, trim: true },
    displayName: { type: String, required: true, trim: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['superadmin', 'admin', 'user'], default: 'user' }
  },
  {
    timestamps: true,
    collection: 'users'
  }
);

UserSchema.index({ email: 1 }, { unique: true });
UserSchema.index({ username: 1 }, { unique: true });

export const User = model<UserDocument>('User', UserSchema);
