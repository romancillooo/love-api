// src/controllers/appController/albumController/addToAlbum.ts
import { Request, Response } from 'express';
import { Album } from '../../../models/appModels/Album';
import { Photo } from '../../../models/appModels/Photo';

/**
 * POST /api/albums/add-photo
 * Agrega una foto existente a uno o varios álbumes.
 * Body: { photoId: string, albumIds: string[] }
 */
export const addPhotoToAlbums = async (req: Request, res: Response) => {
  try {
    const { photoId, albumIds } = req.body ?? {};

    if (typeof photoId !== 'string' || photoId.trim() === '') {
      return res.status(400).json({ error: 'photoId is required' });
    }

    if (!Array.isArray(albumIds) || albumIds.length === 0) {
      return res.status(400).json({ error: 'albumIds must be a non-empty array' });
    }

    const sanitizedPhotoId = photoId.trim();
    const sanitizedAlbumIds = Array.from(
      new Set(
        albumIds
          .filter((id): id is string => typeof id === 'string' && id.trim().length > 0)
          .map((id) => id.trim()),
      ),
    );

    if (sanitizedAlbumIds.length === 0) {
      return res.status(400).json({ error: 'albumIds must contain valid strings' });
    }

    const photo = await Photo.findById(sanitizedPhotoId);
    if (!photo) {
      return res.status(404).json({ error: 'Photo not found' });
    }

    const albums = await Album.find({ _id: { $in: sanitizedAlbumIds } });
    if (albums.length === 0) {
      return res.status(404).json({ error: 'No albums found for provided ids' });
    }

    const updatedAlbums = [] as { id: string; name: string; photoCount: number }[];

    for (const album of albums) {
      const hasPhoto = album.photoIds.some((id) => id.toString() === sanitizedPhotoId);
      if (!hasPhoto) {
        album.photoIds.push(photo._id);
        album.photoCount = album.photoIds.length;
        await album.save();
      }

      updatedAlbums.push({
        id: album._id.toString(),
        name: album.name,
        photoCount: album.photoCount || album.photoIds.length,
      });
    }

    return res.status(200).json({
      message: 'Photo added to album(s) successfully',
      photoId: sanitizedPhotoId,
      albums: updatedAlbums,
    });
  } catch (error: any) {
    console.error('❌ Error adding photo to albums:', error);
    return res.status(500).json({
      error: error?.message || 'Error adding photo to albums',
    });
  }
};
