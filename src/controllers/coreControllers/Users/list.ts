// src/controllers/coreControllers/Users/list.ts
import { asyncHandler } from '@/shared/utils/async-handler';
import { User } from '@/models/coreModels/User';
import { serializeUser } from './serializer';

export const listUsers = asyncHandler(async (_req, res) => {
  const users = await User.find().sort({ createdAt: -1 });
  res.json({
    users: users.map(serializeUser)
  });
});

