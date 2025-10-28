// src/routes/appRoutes/uploadApi.ts
import express from 'express';
import multer from 'multer';
import { uploadImages } from '@/controllers/appControllers/uploadController/uploadImage';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Only image files are allowed!'));
    }
    cb(null, true);
  },
});

const router = express.Router();

// ✅ Cambiado: soporta múltiples archivos ("images" como en el frontend)
router.post('/images', upload.array('images', 10), uploadImages);

export default router;
