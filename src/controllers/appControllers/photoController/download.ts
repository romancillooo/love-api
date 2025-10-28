// src/controllers/appController/photoController/download.ts
import { Request, Response } from 'express';
import { Storage } from '@google-cloud/storage';
import path from 'path';
import { Photo } from '../../../models/appModels/Photo';
import { env } from '@/config/env';
import sharp from 'sharp';

/**
 * GET /api/photos/:id/download
 * Descarga una foto desde Google Cloud Storage
 */
export const downloadPhoto = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // 1️⃣ Buscar el registro en MongoDB
    const photo = await Photo.findById(id);
    if (!photo) {
      return res.status(404).json({ error: 'Photo not found' });
    }

    // 2️⃣ Extraer el bucket y path del archivo desde la URL
    const fileUrl = photo.url;
    // Ejemplo: https://storage.googleapis.com/love-project-public/memories/1761418406841-uuid.webp
    const match = fileUrl.match(/https:\/\/storage\.googleapis\.com\/([^/]+)\/(.+)/);
    if (!match) {
      return res.status(400).json({ error: 'Invalid photo URL format' });
    }

    const bucketName = match[1]; // love-project-public o love-api-uploads
    const filePath = match[2]; // memories/.../file.webp

    // 3️⃣ Inicializar cliente de Google Cloud Storage
    const storageConfig: any = { projectId: env.GCS_PROJECT_ID };
    
    // En desarrollo, usar keyFilename si está configurado
    if (env.NODE_ENV !== 'production' && env.GCS_KEY_FILE) {
      storageConfig.keyFilename = path.resolve(env.GCS_KEY_FILE);
    }
    
    const storage = new Storage(storageConfig);
    const bucket = storage.bucket(bucketName);
    const file = bucket.file(filePath);

    // 4️⃣ Verificar que el archivo existe
    const [exists] = await file.exists();
    if (!exists) {
      return res.status(404).json({ error: 'File not found in storage' });
    }

    // 5️⃣ Obtener metadata del archivo
    const [metadata] = await file.getMetadata();

    // 6️⃣ Generar nombre de descarga limpio
    const originalName = photo.originalName || `photo-${id}`;
    const downloadName = originalName.toLowerCase().endsWith('.png')
      ? originalName
      : `${originalName.replace(/\.(jpg|jpeg|webp|gif|avif|heic|heif)$/i, '')}.png`;

    // 7️⃣ Configurar headers para descarga
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Content-Disposition', `attachment; filename="${downloadName}"`);
    res.setHeader('Cache-Control', 'no-cache');

    // 8️⃣ Stream del archivo al cliente
    const readStream = file.createReadStream();
    const transformer = sharp().png();

    readStream.on('error', (error) => {
      console.error('❌ Error streaming file:', error);
      if (!res.headersSent) {
        res.status(500).json({ error: 'Error downloading file' });
      }
    });

    transformer.on('error', (error) => {
      console.error('❌ Error transforming file to PNG:', error);
      if (!res.headersSent) {
        res.status(500).json({ error: 'Error processing file download' });
      }
    });

    res.on('finish', () => {
      console.log('✅ File downloaded successfully:', downloadName);
    });

    // Pipe del stream al response
    readStream.pipe(transformer).pipe(res);

  } catch (err: any) {
    console.error('❌ Error downloading photo:', err);
    if (!res.headersSent) {
      res.status(500).json({
        error: err.message || 'Error downloading photo'
      });
    }
  }
};
