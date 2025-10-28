// src/routes/appRoutes/albumApi.ts
import express from 'express';
import {
  listAllAlbums,
  getAlbumById,
  createAlbum,
  updateAlbum,
  deleteAlbum,
  addPhotoToAlbums,
  removePhotoFromAlbum,
} from '@/controllers/appControllers/albumController';

const router = express.Router();

/**
 * 📚 GET /api/albums
 * Lista todos los álbumes con paginación y búsqueda opcional.
 */
router.get('/', listAllAlbums);

/**
 * 📘 GET /api/albums/:id
 * Obtiene el detalle de un álbum específico.
 */
router.get('/:id', getAlbumById);

/**
 * ✨ POST /api/albums
 * Crea un nuevo álbum.
 */
router.post('/', createAlbum);

/**
 * 🛠️ PATCH /api/albums/:id
 * Actualiza los datos principales de un álbum.
 */
router.patch('/:id', updateAlbum);

/**
 * 🗑️ DELETE /api/albums/:id
 * Elimina un álbum existente.
 */
router.delete('/:id', deleteAlbum);

/**
 * 📸 POST /api/albums/add-photo
 * Agrega una foto a uno o varios álbumes.
 */
router.post('/add-photo', addPhotoToAlbums);

/**
 * 🗑️ POST /api/albums/remove-photo
 * Quita una foto de un álbum específico.
 */
router.post('/remove-photo', removePhotoFromAlbum);

export default router;
