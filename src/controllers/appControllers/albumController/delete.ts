// src/controllers/appController/albumController/delete.ts
import { Request, Response } from 'express';
import { Album } from '../../../models/appModels/Album';

/**
 * DELETE /api/albums/:id
 * Elimina un álbum existente.
 */
export const deleteAlbum = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const album = await Album.findByIdAndDelete(id);
    if (!album) {
      return res.status(404).json({ error: 'Album not found' });
    }

    res.status(200).json({
      message: 'Album deleted successfully',
      id,
    });
  } catch (err: any) {
    console.error('❌ Error deleting album:', err);

    if (err?.name === 'CastError') {
      return res.status(400).json({ error: 'Invalid album id' });
    }

    res.status(500).json({
      error: err.message || 'Error deleting album',
    });
  }
};
