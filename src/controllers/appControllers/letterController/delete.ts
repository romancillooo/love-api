// src/controllers/appController/letterController/delete.ts
import { Request, Response } from 'express';
import { Types } from 'mongoose';
import { Letter } from '../../../models/appModels/Letter';

/**
 * DELETE /api/letters/:id
 * Elimina una carta. Solo el creador de la carta o un superadmin puede eliminarla.
 */
export const deleteLetter = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const currentUser = req.user;

    if (!currentUser) {
      return res.status(401).json({
        error: 'Usuario no autenticado'
      });
    }

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

    const letter = await Letter.findOne(query).populate('createdBy', 'displayName email username role');

    if (!letter) {
      return res.status(404).json({
        error: 'Letter not found'
      });
    }

    // 🔐 Verificar permisos: solo el creador o superadmin puede eliminar
    const isOwner = letter.createdBy && (letter.createdBy as any)._id.toString() === currentUser.id;
    const isSuperAdmin = currentUser.role === 'superadmin';

    if (!isOwner && !isSuperAdmin) {
      return res.status(403).json({
        error: 'No tienes permiso para eliminar esta carta. Solo el creador puede eliminarla.'
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
