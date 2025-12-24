// src/controllers/coreControllers/Users/getById.ts
import { asyncHandler } from '@/shared/utils/async-handler';
import { userIdSchema } from './schemas';
import { User } from '@/models/coreModels/User';
import { createNotFoundError } from '@/shared/errors/api-error';
import { serializeUser } from './serializer';

export const getUserById = asyncHandler(async (req, res) => {
  const { id } = userIdSchema.parse(req.params);
  const user = await User.findById(id);

  if (!user) {
    throw createNotFoundError('Usuario no encontrado');
  }

  res.json({
    user: serializeUser(user)
  });
});

