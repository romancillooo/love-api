// src/app.ts
import express, { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { registerModules } from './modules';
import { notFoundHandler } from './shared/middlewares/not-found.middleware';
import { errorHandler } from './shared/middlewares/error-handler.middleware';

export function createApp(): Express {
  const app = express();

  app.use(helmet());
  app.use(
    cors({
      origin: '*'
    })
  );
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true }));

  registerModules(app);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

