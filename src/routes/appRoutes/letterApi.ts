// src/routes/appRoutes/letterApi.ts
import express from 'express';
import {
  listAllLetters,
  createLetter,
  updateLetter,
  deleteLetter
} from '@/controllers/appControllers/letterController';
import { authenticate } from '@/shared/middlewares/auth.middleware';
import { requireSuperAdmin } from '@/shared/middlewares/role.middleware';

const router = express.Router();

/**
 * 💌 GET /api/letters
 * Lista todas las cartas (con paginación y búsqueda)
 */
router.get('/', listAllLetters);

/**
 * ✍️ POST /api/letters
 * Crea una nueva carta (cualquier usuario autenticado)
 */
router.post('/', authenticate, createLetter);
router.patch('/:id', authenticate, updateLetter);
router.delete('/:id', authenticate, deleteLetter);

export default router;
