import { NextFunction, Request, Response } from 'express';
import { createForbiddenError, createUnauthorizedError } from '../errors/api-error';

export function requireSuperAdmin(req: Request, _res: Response, next: NextFunction) {
  const user = req.user;

  if (!user) {
    return next(createUnauthorizedError('Se requiere autenticación'));
  }

  if (user.role !== 'superadmin') {
    return next(createForbiddenError('Se requiere rol de superadmin'));
  }

  return next();
}

