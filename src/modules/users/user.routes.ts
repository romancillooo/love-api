import { Router } from 'express';
import { authenticate } from '../../shared/middlewares/auth.middleware';
import { registerAdminCredentials, updateAdminCredentials } from './user.controller';

export const userRouter = Router();

userRouter.post('/register', registerAdminCredentials);

userRouter.use(authenticate);
userRouter.post('/credentials', updateAdminCredentials);
