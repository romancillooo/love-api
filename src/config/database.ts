import mongoose from 'mongoose';
import { env, isProduction } from './env';
import { logger } from '../shared/utils/logger';

mongoose.set('strictQuery', true);

export async function connectDatabase() {
  try {
    await mongoose.connect(env.MONGO_URI, {
      autoCreate: true,
      autoIndex: !isProduction
    });
    logger.info('Connected to MongoDB');
  } catch (error) {
    logger.error('Failed to connect to MongoDB', error);
    throw error;
  }
}

export async function disconnectDatabase() {
  await mongoose.disconnect();
}

