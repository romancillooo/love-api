import { z } from 'zod';

export const updateCredentialsSchema = z.object({
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
  username: z.string().min(3, 'El usuario debe tener al menos 3 caracteres').max(32),
  email: z.string().email().optional()
});

export type UpdateCredentialsInput = z.infer<typeof updateCredentialsSchema>;
