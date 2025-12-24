// src/controllers/coreControllers/Users/schemas.ts
import { z } from 'zod';
import { UserRole } from '@/models/coreModels/User';

export const userRoles: UserRole[] = ['superadmin', 'admin', 'user'];

export const createUserSchema = z.object({
  email: z.string().trim().email('Email inválido'),
  username: z.string().trim().min(3, 'El usuario debe tener al menos 3 caracteres').max(32),
  displayName: z.string().trim().min(1, 'El nombre para mostrar es requerido').max(64).optional(),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
  role: z.enum(userRoles as [UserRole, ...UserRole[]]).optional()
});

export const userIdSchema = z.object({
  id: z.string().trim().min(1, 'Id de usuario requerido')
});
