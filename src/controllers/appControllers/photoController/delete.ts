// src/controllers/appController/photoController/delete.ts
import { Request, Response } from 'express';
import { Storage } from '@google-cloud/storage';
import path from 'path';
import { Photo } from '../../../models/appModels/Photo';
import { env } from '@/config/env';

/**
 * Elimina una foto del bucket de Google Cloud Storage
 * y de la base de datos MongoDB.
 */
export const deletePhoto = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // 1️⃣ Buscar el registro en Mongo
    const photo = await Photo.findById(id);
    if (!photo) {
      return res.status(404).json({ error: 'Photo not found' });
    }

    // 2️⃣ Extraer el bucket y path del archivo desde la URL
    const fileUrl = photo.url;
    // Ejemplo: https://storage.googleapis.com/love-project-public/memories/17300690123-uuid.webp
    const match = fileUrl.match(/https:\/\/storage\.googleapis\.com\/([^/]+)\/(.+)/);
    if (!match) {
      return res.status(400).json({ error: 'Invalid photo URL format' });
    }

    const bucketName = match[1]; // love-project-public o love-api-uploads
    const filePath = match[2]; // memories/.../file.webp

    // 3️⃣ Inicializar cliente de Storage
    const storageConfig: any = { projectId: env.GCS_PROJECT_ID };
    
    // En desarrollo, usar keyFilename si está configurado
    if (env.NODE_ENV !== 'production' && env.GCS_KEY_FILE) {
      storageConfig.keyFilename = path.resolve(env.GCS_KEY_FILE);
    }
    
    const storage = new Storage(storageConfig);
    const bucket = storage.bucket(bucketName);
    const file = bucket.file(filePath);

    // 4️⃣ Eliminar del bucket
    try {
      await file.delete({ ignoreNotFound: true });
    } catch (gcsError: any) {
      console.warn(`⚠️ Warning: Could not delete file from GCS (${bucketName}). It might not exist or access is denied. Proceeding to delete metadata. Error: ${gcsError.message}`);
    }

    // 5️⃣ Eliminar de la base de datos
    await photo.deleteOne();

    // 6️⃣ Responder al frontend
    res.status(200).json({
      message: 'Photo deleted successfully',
      id,
      url: fileUrl,
    });
  } catch (err: any) {
    console.error('Error deleting photo:', err);
    res.status(500).json({
      error: err.message || 'Error deleting photo',
    });
  }
};
