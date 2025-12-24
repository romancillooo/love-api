// src/controllers/appController/letterController/delete.ts
import { Request, Response } from 'express';
import { Types } from 'mongoose';
import { Letter } from '../../../models/appModels/Letter';

/**
 * DELETE /api/letters/:id
 * Elimina una carta utilizando el id numérico o el _id de Mongo.
 */
export const deleteLetter = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        error: 'Letter id is required in params'
      });
    }

    const filters: Record<string, unknown>[] = [];
    const numericId = Number(id);

    if (!Number.isNaN(numericId)) {
      filters.push({ id: numericId });
    }

    if (Types.ObjectId.isValid(id)) {
      filters.push({ _id: id });
    }

    if (filters.length === 0) {
      return res.status(400).json({
        error: 'Invalid letter id format'
      });
    }

    const query =
      filters.length === 1 ? filters[0] : { $or: filters };

    const letter = await Letter.findOne(query).populate('createdBy', 'displayName email username');

    if (!letter) {
      return res.status(404).json({
        error: 'Letter not found'
      });
    }

    await letter.deleteOne();

    res.status(200).json({
      message: 'Letter deleted successfully',
      letter
    });
  } catch (err: any) {
    console.error('❌ Error deleting letter:', err);
    res.status(500).json({
      error: err.message || 'Error deleting letter'
    });
  }
};
