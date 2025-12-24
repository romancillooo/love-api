// src/routes/coreRoutes/userApi.ts
import { Router } from 'express';
import { authenticate } from '@/shared/middlewares/auth.middleware';
import { createUser, getUserById, listUsers } from '@/controllers/coreControllers/Users';

const router = Router();

router.use(authenticate);
router.get('/', listUsers);
router.get('/:id', getUserById);
router.post('/', createUser);

export default router;

