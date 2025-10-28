import { asyncHandler } from '../../shared/utils/async-handler';
import { updateCredentialsSchema } from './user.types';
import { userService } from './user.service';
import { ApiError } from '../../shared/errors/api-error';

export const registerAdminCredentials = asyncHandler(async (req, res) => {
  if (await userService.hasAnyUser()) {
    throw new ApiError(409, 'Ya existe un usuario configurado');
  }

  const { password, username, email } = updateCredentialsSchema.parse(req.body);
  const created = await userService.upsertAdminCredentials({ password, username, email });
  res.status(201).json({
    user: {
      id: created.id,
      email: created.email,
      username: created.username
    }
  });
});

export const updateAdminCredentials = asyncHandler(async (req, res) => {
  const { password, username, email } = updateCredentialsSchema.parse(req.body);
  await userService.upsertAdminCredentials({ password, username, email });
  res.status(204).send();
});
