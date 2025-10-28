import { Request } from 'express';
import { asyncHandler } from '../../shared/utils/async-handler';
import { authService } from './auth.service';
import { AuthUser, loginSchema } from './auth.types';

type AuthenticatedRequest = Request & { user: AuthUser };

export const login = asyncHandler(async (req, res) => {
  const { identifier, password } = loginSchema.parse(req.body);
  const response = await authService.login(identifier, password);
  res.json(response);
});

export const me = asyncHandler(async (req, res) => {
  const { user } = req as AuthenticatedRequest;
  res.json({ user });
});
