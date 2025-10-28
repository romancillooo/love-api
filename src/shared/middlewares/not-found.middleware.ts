import { Request, Response, NextFunction } from 'express';
import { createNotFoundError } from '../errors/api-error';

export function notFoundHandler(req: Request, _res: Response, next: NextFunction) {
  next(createNotFoundError(`Cannot ${req.method} ${req.path}`));
}

