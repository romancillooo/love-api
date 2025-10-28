import { NextFunction, Request, Response } from 'express';
import { ApiError } from '../errors/api-error';
import { logger } from '../utils/logger';

export function errorHandler(
  error: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  if (error instanceof ApiError) {
    if (error.statusCode >= 500) {
      logger.error(error.message, error.details);
    }
    return res.status(error.statusCode).json({
      message: error.message,
      details: error.details
    });
  }

  logger.error('Unexpected error', error);
  return res.status(500).json({
    message: 'Internal server error'
  });
}

