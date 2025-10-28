import { Schema, model, Document } from 'mongoose';

export interface UserDocument extends Document {
  email: string;
  username: string;
  passwordHash: string;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<UserDocument>(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    username: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true }
  },
  {
    timestamps: true,
    collection: 'users'
  }
);

userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ username: 1 }, { unique: true });

export const UserModel = model<UserDocument>('User', userSchema);
