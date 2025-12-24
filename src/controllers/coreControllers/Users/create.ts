// src/controllers/coreControllers/Users/create.ts
import bcrypt from 'bcryptjs';
import { asyncHandler } from '@/shared/utils/async-handler';
import { createUserSchema } from './schemas';
import { ApiError } from '@/shared/errors/api-error';
import { User } from '@/models/coreModels/User';
import { serializeUser } from './serializer';

export const createUser = asyncHandler(async (req, res) => {
  const payload = createUserSchema.parse(req.body);
  const email = payload.email.toLowerCase();
  const username = payload.username.toLowerCase();
  const displayName = payload.displayName?.trim() || payload.username.trim();
  const role = payload.role ?? 'user';

  const existing = await User.findOne({
    $or: [{ email }, { username }]
  });

  if (existing) {
    throw new ApiError(409, 'Ya existe un usuario con este email o username');
  }

  const passwordHash = await bcrypt.hash(payload.password.trim(), 10);
  const user = await User.create({
    email,
    username,
    displayName,
    passwordHash,
    role
  });

  res.status(201).json({
    user: serializeUser(user)
  });
});
