// src/controllers/appController/albumController/list.ts
import { Request, Response } from 'express';
import { Album } from '../../../models/appModels/Album';

/**
 * GET /api/albums/:id
 * Obtiene un álbum individual por su identificador.
 */
export const getAlbumById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const album = await Album.findById(id).lean();
    if (!album) {
      return res.status(404).json({ error: 'Album not found' });
    }

    res.status(200).json({
      message: 'Album retrieved successfully',
      album,
    });
  } catch (err: any) {
    console.error('❌ Error fetching album:', err);

    if (err?.name === 'CastError') {
      return res.status(400).json({ error: 'Invalid album id' });
    }

    res.status(500).json({
      error: err.message || 'Error fetching album',
    });
  }
};
