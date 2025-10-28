import path from 'node:path';
import { readFile } from 'node:fs/promises';
import { connectDatabase, disconnectDatabase } from '../src/config/database';
import { env } from '../src/config/env';
import { PhotoModel } from '../src/modules/photos/photo.model';
import { LetterModel } from '../src/modules/letters/letter.model';
import { logger } from '../src/shared/utils/logger';

const dataDir = path.resolve(__dirname, '..', 'data');

interface PhotoSeed {
  id?: number;
  legacyId?: number;
  title?: string;
  description: string;
  small: string;
  large: string;
  createdAt: string;
  tags?: string[];
  location?: string;
}

interface LetterSeed {
  id?: number;
  legacyId?: number;
  title: string;
  icon: string;
  content: string;
  createdAt?: string;
}

async function loadJson<T>(filename: string): Promise<T> {
  const filePath = path.join(dataDir, filename);
  const raw = await readFile(filePath, 'utf-8');
  return JSON.parse(raw) as T;
}

async function seedPhotos() {
  const photos = await loadJson<PhotoSeed[]>('photos.json');
  await PhotoModel.deleteMany({});
  await PhotoModel.insertMany(
    photos.map(photo => ({
      title: photo.title,
      description: photo.description,
      smallUrl: photo.small,
      largeUrl: photo.large,
      capturedAt: new Date(photo.createdAt),
      tags: photo.tags ?? [],
      location: photo.location,
      legacyId: photo.legacyId ?? photo.id
    }))
  );
  logger.info(`Seeded ${photos.length} photos`);
}

async function seedLetters() {
  const letters = await loadJson<LetterSeed[]>('letters.json');
  await LetterModel.deleteMany({});
  await LetterModel.insertMany(
    letters.map(letter => ({
      title: letter.title,
      icon: letter.icon,
      content: letter.content,
      publishedAt: letter.createdAt ? new Date(letter.createdAt) : undefined,
      legacyId: letter.legacyId ?? letter.id
    }))
  );
  logger.info(`Seeded ${letters.length} letters`);
}

async function main() {
  logger.info(`Seeding database: ${env.MONGO_URI}`);
  await connectDatabase();
  await seedPhotos();
  await seedLetters();
  await disconnectDatabase();
  logger.info('Seed completed');
}

main().catch(async error => {
  logger.error('Seed failed', error);
  await disconnectDatabase();
  process.exit(1);
});
