import { asyncHandler } from '../../shared/utils/async-handler';
import {
  createLetterSchema,
  letterListQuerySchema,
  updateLetterSchema
} from './letter.types';
import { letterService } from './letter.service';

export const listLetters = asyncHandler(async (req, res) => {
  const query = letterListQuerySchema.parse(req.query);
  const result = await letterService.list(query);
  res.json(result);
});

export const getLetter = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const result = await letterService.findById(id);
  res.json(result);
});

export const createLetter = asyncHandler(async (req, res) => {
  const payload = createLetterSchema.parse(req.body);
  const result = await letterService.create(payload);
  res.status(201).json(result);
});

export const updateLetter = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const payload = updateLetterSchema.parse(req.body);
  const result = await letterService.update(id, payload);
  res.json(result);
});

export const deleteLetter = asyncHandler(async (req, res) => {
  const { id } = req.params;
  await letterService.remove(id);
  res.status(204).send();
});

