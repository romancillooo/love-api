import { NextFunction, Request, Response } from 'express';
import { createUnauthorizedError } from '../errors/api-error';
import { authService } from '../../modules/auth/auth.service';

export function authenticate(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;

  if (!header) {
    return next(createUnauthorizedError('Se requiere autenticación'));
  }

  const [scheme, token] = header.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return next(createUnauthorizedError('Formato de token inválido'));
  }

  try {
    const user = authService.verifyToken(token);
    req.user = user;
    req.token = token;
    return next();
  } catch (error) {
    return next(createUnauthorizedError('Token inválido o expirado'));
  }
}

