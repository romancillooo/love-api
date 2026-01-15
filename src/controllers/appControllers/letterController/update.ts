// src/controllers/appController/letterController/update.ts
import { Request, Response } from 'express';
import { Types } from 'mongoose';
import { Letter } from '../../../models/appModels/Letter';

/**
 * PATCH /api/letters/:id
 * Actualiza una carta. Solo el creador de la carta o un superadmin puede editarla.
 * Body: { title?, icon?, content?, publishedAt?, id? }
 */
export const updateLetter = async (req: Request, res: Response) => {
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

    // Primero buscamos la carta para verificar permisos
    const query = filters.length === 1 ? filters[0] : { $or: filters };
    const existingLetter = await Letter.findOne(query);

    if (!existingLetter) {
      return res.status(404).json({
        error: 'Letter not found'
      });
    }

    // 🔐 Verificar permisos: solo el creador o superadmin puede editar
    const isOwner = existingLetter.createdBy && existingLetter.createdBy.toString() === currentUser.id;
    const isSuperAdmin = currentUser.role === 'superadmin';

    if (!isOwner && !isSuperAdmin) {
      return res.status(403).json({
        error: 'No tienes permiso para editar esta carta. Solo el creador puede editarla.'
      });
    }

    const { title, icon, content, publishedAt, id: newId } = req.body;
    const updateData: Record<string, unknown> = {};

    if (title !== undefined) {
      if (typeof title !== 'string' || title.trim() === '') {
        console.log('❌ Update Error: Title invalid', title);
        return res.status(400).json({
          error: 'Title cannot be empty'
        });
      }
      updateData.title = title.trim();
    }

    if (icon !== undefined) {
      if (typeof icon !== 'string' || icon.trim() === '') {
        console.log('❌ Update Error: Icon invalid', icon);
        return res.status(400).json({
          error: 'Icon cannot be empty'
        });
      }
      updateData.icon = icon.trim();
    }

    if (content !== undefined) {
      if (typeof content !== 'string' || content.trim() === '') {
        console.log('❌ Update Error: Content invalid', content);
        return res.status(400).json({
          error: 'Content cannot be empty'
        });
      }
      updateData.content = content.trim();
    }

    if (newId !== undefined) {
      // Si el id enviado es igual al id de la URL, lo ignoramos (es redundante)
      if (newId.toString() === id) {
        // No hacer nada
      } else {
        const parsedId = Number(newId);
        // Solo intentamos actualizar si es un número válido. Si es un string (ObjectId), lo ignoramos.
        if (!Number.isNaN(parsedId)) {
          updateData.id = parsedId;
        }
      }
    }

    if (publishedAt !== undefined) {
      const date = new Date(publishedAt);
      if (Number.isNaN(date.getTime())) {
        console.log('❌ Update Error: publishedAt invalid', publishedAt);
        return res.status(400).json({
          error: 'Invalid publishedAt date format'
        });
      }
      updateData.publishedAt = date;
    }

    if (Object.keys(updateData).length === 0) {
      console.log('❌ Update Error: No valid fields to update. Body:', req.body);
      return res.status(400).json({
        error: 'At least one field is required to update'
      });
    }

    // Ahora sí actualizamos
    const letter = await Letter.findOneAndUpdate(query, updateData, {
      new: true,
      runValidators: true
    });

    await letter!.populate('createdBy', 'displayName email username role');
    await letter!.populate('reactions.user', 'username displayName');

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
