// src/controllers/appController/letterController/create.ts
import { Request, Response } from 'express';
import { Types } from 'mongoose';
import { Letter } from '../../../models/appModels/Letter';
import { User } from '../../../models/coreModels/User';

/**
 * POST /api/letters
 * Crea una nueva carta.
 * Body: { id?, title, icon, content, publishedAt? }
 */
export const createLetter = async (req: Request, res: Response) => {
  try {
    const { id, title, icon, content, publishedAt } = req.body;

    // 1️⃣ Validar campos requeridos
    if (!title || !icon || !content) {
      return res.status(400).json({
        error: 'Missing required fields',
        required: ['title', 'icon', 'content']
      });
    }

    // 2️⃣ Validar que title e icon no estén vacíos
    if (title.trim() === '' || icon.trim() === '' || content.trim() === '') {
      return res.status(400).json({
        error: 'Title, icon and content cannot be empty'
      });
    }

    const bodyUserId = typeof req.body?.userId === 'string' ? req.body.userId.trim() : undefined;
    const creatorId =
      (req.user?.id && Types.ObjectId.isValid(req.user.id) ? req.user.id : undefined) || bodyUserId;

    if (!creatorId) {
      return res.status(400).json({
        error: 'userId is required to create a letter'
      });
    }

    const creator = await User.findById(creatorId);

    if (!creator) {
      return res.status(404).json({
        error: 'Creator user not found'
      });
    }

    // 3️⃣ Crear el documento
    const letterData: any = {
      title: title.trim(),
      icon: icon.trim(),
      content: content.trim(),
      createdBy: creator._id
    };

    // Agregar ID si se proporciona (opcional)
    if (id !== undefined) {
      letterData.id = Number(id);
    }

    // Agregar publishedAt si se proporciona
    if (publishedAt) {
      const date = new Date(publishedAt);
      if (isNaN(date.getTime())) {
        return res.status(400).json({
          error: 'Invalid publishedAt date format'
        });
      }
      letterData.publishedAt = date;
    }

    // 4️⃣ Guardar en la base de datos
    const letter = await Letter.create(letterData);
    await letter.populate('createdBy', 'displayName email username role');
    await letter.populate('reactions.user', 'username displayName');

    // 5️⃣ Responder con la carta creada
    res.status(201).json({
      message: 'Letter created successfully',
      letter
    });
  } catch (err: any) {
    console.error('❌ Error creating letter:', err);
    
    // Manejo de errores de duplicado (si existe id único)
    if (err.code === 11000) {
      return res.status(409).json({
        error: 'A letter with this id already exists'
      });
    }

    res.status(500).json({
      error: err.message || 'Error creating letter'
    });
  }
};
