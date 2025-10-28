// src/controllers/appController/albumController/listAll.ts
import { Request, Response } from 'express';
import { Album } from '../../../models/appModels/Album';

/**
 * GET /api/albums
 * Lista los álbumes con soporte de paginación y búsqueda.
 */
export const listAllAlbums = async (req: Request, res: Response) => {
  try {
    const limitParam = Number(req.query.limit);
    const pageParam = Number(req.query.page);
    const search = typeof req.query.search === 'string' ? req.query.search.trim() : '';

    const limit = Number.isFinite(limitParam) && limitParam > 0 ? Math.min(limitParam, 100) : 50;
    const page = Number.isFinite(pageParam) && pageParam > 0 ? pageParam : 1;
    const skip = (page - 1) * limit;

    const filters: Record<string, unknown> = {};

    if (search) {
      const regex = new RegExp(search, 'i');
      filters.$or = [{ name: regex }, { description: regex }];
    }

    const [albums, total] = await Promise.all([
      Album.find(filters)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Album.countDocuments(filters),
    ]);

    res.status(200).json({
      message: 'Albums retrieved successfully',
      albums,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit) || 1,
      },
    });
  } catch (err: any) {
    console.error('❌ Error fetching albums:', err);
    res.status(500).json({
      error: err.message || 'Error fetching albums',
    });
  }
};
