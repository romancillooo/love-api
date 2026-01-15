// src/controllers/appController/letterController/react.ts
import { Request, Response } from 'express';
import { Types } from 'mongoose';
import { Letter } from '../../../models/appModels/Letter';

/**
 * POST /api/letters/:id/react
 * Agrega, cambia o elimina una reacción a una carta.
 * 
 * Reglas de negocio:
 * - Si el usuario NO tiene reacción → Agregar nueva reacción
 * - Si el usuario YA tiene reacción con OTRO emoji → Reemplazar con el nuevo
 * - Si el usuario YA tiene reacción con el MISMO emoji → Eliminar la reacción (toggle off)
 * 
 * Body: { emoji: string }
 */
export const reactToLetter = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { emoji } = req.body;
    const currentUser = req.user;

    // 🔐 Verificar autenticación
    if (!currentUser) {
      return res.status(401).json({
        error: 'Usuario no autenticado'
      });
    }

    // ✅ Validar que se envió el emoji
    if (!emoji || typeof emoji !== 'string' || emoji.trim() === '') {
      return res.status(400).json({
        error: 'El emoji es requerido'
      });
    }

    // Opcional: Validar longitud para evitar textos largos (un emoji suele ser 1-2 chars, algunos compuestos más)
    // Dejamos un margen razonable de 10 caracteres por si es un emoji complejo
    if (emoji.length > 10) {
      return res.status(400).json({
        error: 'El emoji es demasiado largo'
      });
    }

    // 🔍 Buscar la carta (por _id o id numérico)
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
        error: 'Formato de ID inválido'
      });
    }

    const query = filters.length === 1 ? filters[0] : { $or: filters };
    const letter = await Letter.findOne(query);

    if (!letter) {
      return res.status(404).json({
        error: 'Carta no encontrada'
      });
    }

    const userId = currentUser.id;
    
    // 🔍 Buscar si el usuario ya tiene una reacción en esta carta
    const existingIndex = letter.reactions.findIndex(
      (r: any) => r.user.toString() === userId.toString()
    );

    let actionMessage: string;

    if (existingIndex !== -1) {
      // Ya existe una reacción de este usuario
      const existingReaction = letter.reactions[existingIndex];
      
      if (existingReaction.emoji === emoji) {
        // 🔄 Mismo emoji = toggle off (eliminar)
        letter.reactions.splice(existingIndex, 1);
        actionMessage = 'Reacción eliminada';
      } else {
        // 🔁 Diferente emoji = reemplazar
        letter.reactions[existingIndex].emoji = emoji;
        letter.reactions[existingIndex].createdAt = new Date();
        actionMessage = 'Reacción actualizada';
      }
    } else {
      // ➕ No existe = agregar nueva reacción
      letter.reactions.push({
        emoji,
        user: new Types.ObjectId(userId),
        createdAt: new Date()
      } as any);
      actionMessage = 'Reacción agregada';
    }

    await letter.save();

    // 📤 Populate y devolver
    await letter.populate('reactions.user', 'username displayName');
    await letter.populate('createdBy', 'displayName email username role');

    res.status(200).json({
      message: actionMessage,
      letter
    });
  } catch (err: any) {
    console.error('❌ Error reacting to letter:', err);
    res.status(500).json({
      error: err.message || 'Error al procesar la reacción'
    });
  }
};
