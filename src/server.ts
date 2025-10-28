// src/server.ts
import 'tsconfig-paths/register'; // 👈 debe ser lo PRIMERO que se ejecuta

import { createApp } from './app';
import { connectDatabase } from './config/database';
import { env } from './config/env';
import { logger } from './shared/utils/logger';

async function bootstrap() {
  const app = createApp();

  await connectDatabase();

  app.listen(env.PORT, () => {
    logger.info(`Server running on port ${env.PORT}`);
  });
}

bootstrap().catch(error => {
  logger.error('Fatal error while starting the server', error);
  process.exit(1);
});

process.on('unhandledRejection', reason => {
  logger.error('Unhandled rejection', reason);
});

process.on('uncaughtException', error => {
  logger.error('Uncaught exception', error);
  process.exit(1);
});
