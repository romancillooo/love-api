// src/controllers/appController/albumController/update.ts
import { Request, Response } from 'express';
import { Album } from '../../../models/appModels/Album';

/**
 * PATCH /api/albums/:id
 * Actualiza los datos principales de un álbum.
 */
export const updateAlbum = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, description, coverPhotoUrl, photoIds } = req.body ?? {};

    const album = await Album.findById(id);
    if (!album) {
      return res.status(404).json({ error: 'Album not found' });
    }

    if (name !== undefined) {
      if (typeof name !== 'string' || name.trim() === '') {
        return res.status(400).json({ error: 'Album name cannot be empty' });
      }
      const trimmedName = name.trim();
      if (trimmedName.length > 50) {
        return res.status(400).json({ error: 'Album name must be 50 characters or fewer' });
      }
      album.name = trimmedName;
    }

    if (description !== undefined) {
      if (typeof description !== 'string') {
        return res.status(400).json({ error: 'Album description must be a string' });
      }
      album.description = description.trim().slice(0, 200);
    }

    if (coverPhotoUrl !== undefined) {
      if (coverPhotoUrl === null) {
        album.coverPhotoUrl = undefined;
      } else if (typeof coverPhotoUrl === 'string') {
        const trimmed = coverPhotoUrl.trim();
        album.coverPhotoUrl = trimmed.length > 0 ? trimmed : undefined;
      } else {
        return res.status(400).json({ error: 'coverPhotoUrl must be a string or null' });
      }
    }

    if (photoIds !== undefined) {
      if (!Array.isArray(photoIds)) {
        return res.status(400).json({ error: 'photoIds must be an array of strings' });
      }
      const normalizedPhotoIds = photoIds
        .filter((value) => typeof value === 'string' && value.trim().length > 0)
        .map((value) => value.trim());

      album.photoIds = normalizedPhotoIds;
      album.photoCount = normalizedPhotoIds.length;
    }

    await album.save();

    res.status(200).json({
      message: 'Album updated successfully',
      album,
    });
  } catch (err: any) {
    console.error('❌ Error updating album:', err);

    if (err?.name === 'CastError') {
      return res.status(400).json({ error: 'Invalid album id' });
    }

    res.status(500).json({
      error: err.message || 'Error updating album',
    });
  }
};
