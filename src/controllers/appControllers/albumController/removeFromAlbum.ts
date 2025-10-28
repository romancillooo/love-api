// src/controllers/appController/albumController/removeFromAlbum.ts
import { Request, Response } from 'express';
import { Album } from '../../../models/appModels/Album';

/**
 * POST /api/albums/remove-photo
 * Remueve una foto de un álbum específico.
 * Body: { photoId: string, albumId: string }
 */
export const removePhotoFromAlbum = async (req: Request, res: Response) => {
  try {
    const { photoId, albumId } = req.body ?? {};

    if (typeof photoId !== 'string' || photoId.trim() === '') {
      return res.status(400).json({ error: 'photoId is required' });
    }

    if (typeof albumId !== 'string' || albumId.trim() === '') {
      return res.status(400).json({ error: 'albumId is required' });
    }

    const sanitizedPhotoId = photoId.trim();
    const sanitizedAlbumId = albumId.trim();

    const album = await Album.findById(sanitizedAlbumId);
    if (!album) {
      return res.status(404).json({ error: 'Album not found' });
    }

    const originalLength = album.photoIds.length;
    album.photoIds = album.photoIds.filter((id) => id.toString() !== sanitizedPhotoId);

    if (album.photoIds.length === originalLength) {
      return res.status(200).json({
        message: 'Photo was not part of the album',
        albumId: sanitizedAlbumId,
        photoId: sanitizedPhotoId,
        photoCount: album.photoIds.length,
      });
    }

    album.photoCount = album.photoIds.length;
    await album.save();

    res.status(200).json({
      message: 'Photo removed from album successfully',
      albumId: sanitizedAlbumId,
      photoId: sanitizedPhotoId,
      photoCount: album.photoCount,
    });
  } catch (error: any) {
    console.error('❌ Error removing photo from album:', error);
    res.status(500).json({ error: error?.message || 'Error removing photo from album' });
  }
};
