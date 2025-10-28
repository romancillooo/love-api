// src/controllers/appControllers/uploadController/uploadImage.ts
import { Request, Response } from 'express';
import { uploadImageToGCS } from '@/utils/uploadImageToGCS';
import { Photo } from '../../../models/appModels/Photo';
import sharp from 'sharp';
import path from 'path';

/**
 * Sube múltiples imágenes al bucket de Google Cloud Storage,
 * las convierte a formato WebP y guarda los metadatos en MongoDB.
 */
export const uploadImages = async (req: Request, res: Response) => {
  try {
    const files = req.files as Express.Multer.File[];

    if (!files || files.length === 0) {
      return res.status(400).json({ error: 'No images provided' });
    }

    const folder = (req.query.folder as string) || 'photos';
    const results = [];


    for (const file of files) {
      const originalExt = path.extname(file.originalname).toLowerCase();
      let processedBuffer = file.buffer;
      let outputMime = 'image/webp';
      let outputExt = '.webp';

      if (originalExt === '.heic' || originalExt === '.heif') {
        try {
          const { default: heicConvert } = await import('heic-convert');
          processedBuffer = await heicConvert({
            buffer: file.buffer,
            format: 'PNG',
            quality: 1,
          });
          outputMime = 'image/png';
          outputExt = '.png';
        } catch (heicError) {
          console.warn('⚠️ Unable to convert HEIC/HEIF image, keeping original buffer:', heicError);
          processedBuffer = file.buffer;
          outputMime = file.mimetype || 'image/heic';
          outputExt = originalExt || '.heic';
        }
      } else {
        try {
          const basePipeline = sharp(file.buffer).rotate();
          processedBuffer = await basePipeline.webp({ quality: 85 }).toBuffer();
          outputMime = 'image/webp';
          outputExt = '.webp';
        } catch (conversionError) {
          console.warn('⚠️ Unable to convert image to WebP, using original buffer:', conversionError);
          processedBuffer = file.buffer;
          outputMime = file.mimetype || 'application/octet-stream';
          outputExt = originalExt || '';
        }
      }

      // 🔹 Actualizar propiedades del archivo antes de subir
      file.buffer = processedBuffer;
      file.size = processedBuffer.length;
      file.mimetype = outputMime;
      if (outputExt) {
        const baseName = file.originalname.replace(/\.[^/.]+$/, '');
        file.originalname = `${baseName}${outputExt}`;
      }

      // 🔹 Subir imagen a Google Cloud Storage
      const imageUrl = await uploadImageToGCS(file, folder);

      // 🔹 Guardar en MongoDB
      const photo = await Photo.create({
        url: imageUrl,
        format: outputMime.split('/')[1] || outputExt.replace('.', '') || 'binary',
        folder,
        originalName: file.originalname,
        size: file.size,
      });

      results.push(photo);
    }

    // 🔹 Respuesta final
    return res.status(200).json({
      message: 'Images uploaded, converted and saved successfully',
      photos: results,
    });
  } catch (err: any) {
    console.error('❌ Error uploading images:', err);
    return res.status(500).json({
      error: err.message || 'Error uploading images',
    });
  }
};
