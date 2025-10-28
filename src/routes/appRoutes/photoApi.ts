// src/routes/appRoutes/photoApi.ts
import express from 'express';
import { listAllPhotos, deletePhoto, updatePhoto, downloadPhoto } from '@/controllers/appControllers/photoController';

const router = express.Router();

/**
 * 📸 GET /api/photos
 * Lista todas las fotos (con paginación opcional)
 */
router.get('/', listAllPhotos);

/**
 * 📥 GET /api/photos/:id/download
 * Descarga una foto
 */
router.get('/:id/download', downloadPhoto);

/**
 * ✏️ PATCH /api/photos/:id
 * Actualiza una foto (por ejemplo, marcar como favorita)
 */
router.patch('/:id', updatePhoto);

/**
 * 🗑️ DELETE /api/photos/:id
 * Elimina una foto del bucket y de la base de datos
 */
router.delete('/:id', deletePhoto);

export default router;
