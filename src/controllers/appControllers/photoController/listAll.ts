// src/controllers/appController/photoController/listAll.ts
import { Request, Response } from 'express';
import { Photo } from '../../../models/appModels/Photo';

/**
 * GET /api/photos
 * Lista todas las fotos con paginación y filtros opcionales.
 * Query params: limit, page, folder, isFavorite
 */
export const listAllPhotos = async (req: Request, res: Response) => {
  try {
    const limit = Number(req.query.limit) || 50;
    const page = Number(req.query.page) || 1;
    const folder = (req.query.folder as string) || undefined;
    const isFavorite = req.query.isFavorite as string | undefined;
    const skip = (page - 1) * limit;

    // 🔹 Filtros dinámicos
    const filters: Record<string, any> = {};
    if (folder) filters.folder = folder;
    if (isFavorite === 'true') filters.isFavorite = true;
    if (isFavorite === 'false') filters.isFavorite = false;

    // 🔹 Consulta con paginación y orden descendente por fecha
    const [photos, total] = await Promise.all([
      Photo.find(filters)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Photo.countDocuments(filters)
    ]);

    res.status(200).json({
      message: 'Photos retrieved successfully',
      photos,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (err: any) {
    console.error('❌ Error fetching photos:', err);
    res.status(500).json({
      error: err.message || 'Error fetching photos'
    });
  }
};
