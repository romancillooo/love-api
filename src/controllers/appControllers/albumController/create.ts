// src/controllers/appController/albumController/create.ts
import { Request, Response } from 'express';
import { Album } from '../../../models/appModels/Album';

/**
 * POST /api/albums
 * Crea un nuevo álbum para agrupar fotos.
 */
export const createAlbum = async (req: Request, res: Response) => {
  try {
    const { name, description, coverPhotoUrl, photoIds } = req.body ?? {};

    if (typeof name !== 'string' || name.trim() === '') {
      return res.status(400).json({
        error: 'Album name is required',
      });
    }

    const trimmedName = name.trim();
    if (trimmedName.length > 50) {
      return res.status(400).json({
        error: 'Album name must be 50 characters or fewer',
      });
    }

    let normalizedDescription = '';
    if (typeof description === 'string') {
      normalizedDescription = description.trim().slice(0, 200);
    }

    let normalizedCover: string | undefined;
    if (typeof coverPhotoUrl === 'string') {
      const trimmed = coverPhotoUrl.trim();
      normalizedCover = trimmed.length > 0 ? trimmed : undefined;
    }

    let normalizedPhotoIds: string[] = [];
    if (Array.isArray(photoIds)) {
      normalizedPhotoIds = photoIds
        .filter((id) => typeof id === 'string' && id.trim().length > 0)
        .map((id) => id.trim());
    }

    const album = await Album.create({
      name: trimmedName,
      description: normalizedDescription,
      coverPhotoUrl: normalizedCover,
      photoIds: normalizedPhotoIds,
      photoCount: normalizedPhotoIds.length,
    });

    res.status(201).json({
      message: 'Album created successfully',
      album,
    });
  } catch (err: any) {
    console.error('❌ Error creating album:', err);
    res.status(500).json({
      error: err.message || 'Error creating album',
    });
  }
};
