import { z } from 'zod';

export const createLetterSchema = z.object({
  title: z.string().trim().min(1, 'Title is required'),
  icon: z.string().trim().min(1, 'Icon is required'),
  content: z.string().trim().min(1, 'Content is required'),
  createdAt: z.coerce.date().optional(),
  legacyId: z.coerce.number().int().positive().optional()
});

export const updateLetterSchema = createLetterSchema.partial().refine(
  data => Object.keys(data).length > 0,
  {
    message: 'At least one field must be provided to update the letter'
  }
);

export const letterListQuerySchema = z.object({
  search: z.string().trim().optional(),
  limit: z.coerce.number().int().min(1).max(500).default(50),
  page: z.coerce.number().int().min(1).default(1)
});

export type CreateLetterInput = z.infer<typeof createLetterSchema>;
export type UpdateLetterInput = z.infer<typeof updateLetterSchema>;
export type LetterListQuery = z.infer<typeof letterListQuerySchema>;

export interface LetterDTO {
  id: string;
  title: string;
  icon: string;
  content: string;
  createdAt?: string;
  legacyId?: number;
}

export interface LetterListResponse {
  data: LetterDTO[];
  meta: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}
