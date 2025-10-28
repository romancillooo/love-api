import { Router } from 'express';
import os from 'node:os';

export const healthRouter = Router();

healthRouter.get('/', (_req, res) => {
  res.json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV ?? 'development',
    host: os.hostname()
  });
});

