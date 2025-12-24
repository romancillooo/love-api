// src/controllers/appController/photoController/update.ts
import { Request, Response } from 'express';
import { Photo } from '../../../models/appModels/Photo';

/**
 * PATCH /api/photos/:id
 * Actualiza campos de una foto (como isFavorite).
 */
export const updatePhoto = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { isFavorite } = req.body;

    // 1️⃣ Buscar la foto
    const photo = await Photo.findById(id);
    if (!photo) {
      return res.status(404).json({ error: 'Photo not found' });
    }

    // 2️⃣ Actualizar campos permitidos
    if (typeof isFavorite === 'boolean') {
      photo.isFavorite = isFavorite;
    }

    // 3️⃣ Guardar cambios
    await photo.save();
    await photo.populate('uploadedBy', 'displayName email username');

    // 4️⃣ Responder
    res.status(200).json({
      message: 'Photo updated successfully',
      photo
    });
  } catch (err: any) {
    console.error('❌ Error updating photo:', err);
    res.status(500).json({
      error: err.message || 'Error updating photo'
    });
  }
};
