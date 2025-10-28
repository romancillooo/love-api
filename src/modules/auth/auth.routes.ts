import { Router } from 'express';
import { login, me } from './auth.controller';
import { authenticate } from '../../shared/middlewares/auth.middleware';

export const authRouter = Router();

authRouter.post('/login', login);
authRouter.get('/me', authenticate, me);

