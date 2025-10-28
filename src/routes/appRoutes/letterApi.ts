// src/routes/appRoutes/letterApi.ts
import express from 'express';
import { listAllLetters, createLetter } from '@/controllers/appControllers/letterController';

const router = express.Router();

/**
 * 💌 GET /api/letters
 * Lista todas las cartas (con paginación y búsqueda)
 */
router.get('/', listAllLetters);

/**
 * ✍️ POST /api/letters
 * Crea una nueva carta (para uso desde Postman)
 */
router.post('/', createLetter);

export default router;

