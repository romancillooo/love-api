// src/modules/index.ts
import { Express } from 'express';
import { healthRouter } from './health/health.routes';
import { authRouter } from './auth/auth.routes';
import { userRouter } from './users/user.routes';

import uploadRouter from '../routes/appRoutes/uploadApi';
import photoRouter from '../routes/appRoutes/photoApi';
import letterRouter from '../routes/appRoutes/letterApi';
import albumRouter from '../routes/appRoutes/albumApi';

export function registerModules(app: Express) {
  app.use('/api/health', healthRouter);
  app.use('/api/auth', authRouter);
  app.use('/api/letters', letterRouter);
  app.use('/api/albums', albumRouter);
  app.use('/api/photos', photoRouter);
  app.use('/api/users', userRouter);
  app.use('/api/upload', uploadRouter);
}
