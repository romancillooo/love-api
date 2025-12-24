// src/controllers/coreControllers/Users/serializer.ts
import { UserDocument } from '@/models/coreModels/User';

export const serializeUser = (user: UserDocument) => {
  const plain = user.toObject();
  delete plain.passwordHash;
  return plain;
};

