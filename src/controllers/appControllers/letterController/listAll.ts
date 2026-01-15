// src/controllers/appController/letterController/listAll.ts
import { Request, Response } from 'express';
import { Letter } from '../../../models/appModels/Letter';

/**
 * GET /api/letters
 * Lista todas las cartas con paginación y filtros opcionales.
 * Query params: limit, page, search
 */
export const listAllLetters = async (req: Request, res: Response) => {
  try {
    const limit = Number(req.query.limit) || 50;
    const page = Number(req.query.page) || 1;
    const search = (req.query.search as string) || '';
    const skip = (page - 1) * limit;

    // 🔹 Filtros dinámicos
    const filters: Record<string, any> = {};

    // Búsqueda por título o contenido (simple)
    if (search) {
      filters.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } }
      ];
    }

    // 🔹 Consulta con paginación y orden descendente por fecha
    const [letters, total] = await Promise.all([
      Letter.find(filters)
        .sort({ publishedAt: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('createdBy', 'displayName email username role')
        .populate('reactions.user', 'username displayName')
        .lean(), // Mejora el performance
      Letter.countDocuments(filters)
    ]);

    res.status(200).json({
      message: 'Letters retrieved successfully',
      letters,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (err: any) {
    console.error('❌ Error fetching letters:', err);
    res.status(500).json({
      error: err.message || 'Error fetching letters'
    });
  }
};
