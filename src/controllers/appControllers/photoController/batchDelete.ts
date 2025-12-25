// src/controllers/appControllers/photoController/batchDelete.ts
import { Request, Response } from 'express';
import { Storage } from '@google-cloud/storage';
import path from 'path';
import { Photo } from '../../../models/appModels/Photo';
import { env } from '@/config/env';

/**
 * Elimina múltiples fotos del bucket de Google Cloud Storage
 * y de la base de datos MongoDB en una sola petición.
 */
export const batchDeletePhotos = async (req: Request, res: Response) => {
  try {
    const { ids } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: 'No photo IDs provided' });
    }

    // 1️⃣ Buscar todos los registros en Mongo
    const photos = await Photo.find({ _id: { $in: ids } });

    if (photos.length === 0) {
      return res.status(404).json({ error: 'No photos found for the provided IDs' });
    }

    // 2️⃣ Configurar cliente de Storage una sola vez
    const storageConfig: any = { projectId: env.GCS_PROJECT_ID };
    if (env.NODE_ENV !== 'production' && env.GCS_KEY_FILE) {
      storageConfig.keyFilename = path.resolve(env.GCS_KEY_FILE);
    }
    const storage = new Storage(storageConfig);

    const deletedIds: string[] = [];
    const errors: any[] = [];

    // 3️⃣ Procesar borrado de archivos en paralelo (GCS)
    await Promise.all(
      photos.map(async (photo) => {
        try {
          const fileUrl = photo.url;
          // Extraer info del bucket
          const match = fileUrl.match(/https:\/\/storage\.googleapis\.com\/([^/]+)\/(.+)/);
          
          if (match) {
            const bucketName = match[1];
            const filePath = match[2];
            const bucket = storage.bucket(bucketName);
            const file = bucket.file(filePath);

            try {
               await file.delete({ ignoreNotFound: true });
            } catch (gcsError: any) {
               console.warn(`⚠️ Warning: Could not delete file ${filePath} from GCS. Error: ${gcsError.message}`);
               // Continuamos aunque falle GCS (limpieza de DB es prioritaria)
            }
          }
          
          deletedIds.push(String(photo._id));
        } catch (err: any) {
          console.error(`Error processing photo ${photo._id}:`, err);
          errors.push({ id: photo._id, error: err.message });
        }
      })
    );

    // 4️⃣ Eliminar registros de la base de datos masivamente
    if (deletedIds.length > 0) {
      await Photo.deleteMany({ _id: { $in: deletedIds } });
    }

    // 5️⃣ Respuesta final
    res.status(200).json({
      message: 'Batch delete processed',
      deletedCount: deletedIds.length,
      deletedIds,
      errors: errors.length > 0 ? errors : undefined,
    });

  } catch (err: any) {
    console.error('Error batch deleting photos:', err);
    res.status(500).json({
      error: err.message || 'Error processing batch delete',
    });
  }
};
