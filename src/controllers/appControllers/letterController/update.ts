// src/controllers/appController/letterController/update.ts
import { Request, Response } from 'express';
import { Types } from 'mongoose';
import { Letter } from '../../../models/appModels/Letter';

/**
 * PATCH /api/letters/:id
 * Actualiza una carta utilizando el id numérico o el _id de Mongo.
 * Body: { title?, icon?, content?, publishedAt?, id? }
 */
export const updateLetter = async (req: Request, res: Response) => {
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

    const { title, icon, content, publishedAt, id: newId } = req.body;
    const updateData: Record<string, unknown> = {};

    if (title !== undefined) {
      if (typeof title !== 'string' || title.trim() === '') {
        return res.status(400).json({
          error: 'Title cannot be empty'
        });
      }
      updateData.title = title.trim();
    }

    if (icon !== undefined) {
      if (typeof icon !== 'string' || icon.trim() === '') {
        return res.status(400).json({
          error: 'Icon cannot be empty'
        });
      }
      updateData.icon = icon.trim();
    }

    if (content !== undefined) {
      if (typeof content !== 'string' || content.trim() === '') {
        return res.status(400).json({
          error: 'Content cannot be empty'
        });
      }
      updateData.content = content.trim();
    }

    if (newId !== undefined) {
      const parsedId = Number(newId);
      if (Number.isNaN(parsedId)) {
        return res.status(400).json({
          error: 'id must be a valid number'
        });
      }
      updateData.id = parsedId;
    }

    if (publishedAt !== undefined) {
      const date = new Date(publishedAt);
      if (Number.isNaN(date.getTime())) {
        return res.status(400).json({
          error: 'Invalid publishedAt date format'
        });
      }
      updateData.publishedAt = date;
    }

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        error: 'At least one field is required to update'
      });
    }

    const query =
      filters.length === 1 ? filters[0] : { $or: filters };

    const letter = await Letter.findOneAndUpdate(query, updateData, {
      new: true,
      runValidators: true
    });

    if (!letter) {
      return res.status(404).json({
        error: 'Letter not found'
      });
    }

    await letter.populate('createdBy', 'displayName email username');

    res.status(200).json({
      message: 'Letter updated successfully',
      letter
    });
  } catch (err: any) {
    console.error('❌ Error updating letter:', err);
    res.status(500).json({
      error: err.message || 'Error updating letter'
    });
  }
};
