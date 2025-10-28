import { Router } from 'express';
import { authenticate } from '../../shared/middlewares/auth.middleware';
import {
  createLetter,
  deleteLetter,
  getLetter,
  listLetters,
  updateLetter
} from './letter.controller';

export const letterRouter = Router();

letterRouter.get('/', listLetters);
letterRouter.get('/:id', getLetter);

letterRouter.post('/', authenticate, createLetter);
letterRouter.patch('/:id', authenticate, updateLetter);
letterRouter.delete('/:id', authenticate, deleteLetter);

