// src/utils/uploadImageToGCS.ts
import { Storage } from '@google-cloud/storage';
import path from 'path';
import { randomUUID } from 'crypto';
import { env } from '@/config/env';
import fs from 'fs';

// En producción (App Engine), usar Application Default Credentials
// En desarrollo, usar el archivo de clave si existe
const storageConfig: any = {
  projectId: env.GCS_PROJECT_ID,
};

// Solo usar keyFilename en desarrollo si el archivo existe
if (env.NODE_ENV !== 'production' && env.GCS_KEY_FILE) {
  const keyFilePath = path.resolve(env.GCS_KEY_FILE);
  if (fs.existsSync(keyFilePath)) {
    storageConfig.keyFilename = keyFilePath;
  }
}

const storage = new Storage(storageConfig);
const bucket = storage.bucket(env.GCS_BUCKET_NAME);

export async function uploadImageToGCS(file: any, folder?: string): Promise<string> {
  if (!file) throw new Error('No file provided');
  if (!file.mimetype?.startsWith('image/')) throw new Error('Invalid file type.');

  // 🩷 Crear nombre final
  const prefix = folder ? `${folder}/` : '';
  const extFromName = path.extname(file.originalname) || '';
  const ext = extFromName || `.${file.mimetype?.split('/')[1] || 'bin'}`;
  const filename = `${prefix}${Date.now()}-${randomUUID()}${ext}`;
  const blob = bucket.file(filename);

  // 🩷 Subir el buffer webp
  const blobStream = blob.createWriteStream({
    resumable: false,
    contentType: file.mimetype,
    metadata: {
      cacheControl: 'public, max-age=31536000', // 1 year cache
    },
  });

  return new Promise((resolve, reject) => {
    blobStream.on('error', reject);
    blobStream.on('finish', async () => {
      try {
        await blob.makePublic();
        const publicUrl = `https://storage.googleapis.com/${env.GCS_BUCKET_NAME}/${filename}`;
        resolve(publicUrl);
      } catch (err) {
        reject(err);
      }
    });

    blobStream.end(file.buffer);
  });
}
