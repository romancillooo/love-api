import { z } from 'zod';

export const loginSchema = z.object({
  identifier: z.string().trim().min(1, 'Email o usuario es requerido'),
  password: z.string().min(1, 'Password is required')
});

export type LoginInput = z.infer<typeof loginSchema>;

export interface AuthUser {
  id: string;
  email: string;
  username: string;
  role: 'admin';
}

export interface AuthTokenPayload {
  sub: string;
  role: AuthUser['role'];
  email: string;
  username: string;
  type: 'access';
}

export interface AuthResponse {
  token: string;
  expiresIn: string;
  user: AuthUser;
}
