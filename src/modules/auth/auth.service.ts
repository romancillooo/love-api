import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { env } from '../../config/env';
import { ApiError } from '../../shared/errors/api-error';
import { AuthResponse, AuthTokenPayload, AuthUser } from './auth.types';
import { User } from '@/models/coreModels/User';

const ADMIN_SUBJECT = 'love-admin';

class AuthService {
  private async verifyCredentials(identifier: string, password: string): Promise<AuthUser | null> {
    const trimmedPassword = password.trim();
    const normalizedIdentifier = identifier.trim().toLowerCase();

    const storedUser = await User.findOne({
      $or: [{ email: normalizedIdentifier }, { username: normalizedIdentifier }]
    });
    const fallbackEmail = env.ADMIN_EMAIL.toLowerCase();
    const fallbackUsername = env.ADMIN_USERNAME.toLowerCase();

    if (storedUser) {
      const match = await bcrypt.compare(trimmedPassword, storedUser.passwordHash);
      if (!match) {
        return null;
      }
      return {
        id: storedUser.id,
        email: storedUser.email ?? fallbackEmail,
        username: storedUser.username ?? fallbackUsername,
        role: storedUser.role ?? 'user'
      };
    }

    const fallbackIdentifiers = [fallbackEmail, fallbackUsername];
    if (!fallbackIdentifiers.includes(normalizedIdentifier)) {
      return null;
    }

    if (env.ADMIN_PASSWORD_HASH) {
      const match = await bcrypt.compare(trimmedPassword, env.ADMIN_PASSWORD_HASH);
      if (!match) {
        return null;
      }
    } else if (trimmedPassword !== env.ADMIN_PASSWORD) {
      return null;
    }

      return {
        id: ADMIN_SUBJECT,
        email: fallbackEmail,
        username: fallbackUsername,
        role: 'superadmin'
      };
  }

  private generateToken(user: AuthUser): string {
    const payload: AuthTokenPayload = {
      sub: user.id,
      role: user.role,
      email: user.email,
      username: user.username,
      type: 'access'
    };

    const options: jwt.SignOptions = {
      expiresIn: env.JWT_EXPIRATION as jwt.SignOptions['expiresIn']
    };

    return jwt.sign(payload as jwt.JwtPayload, env.JWT_SECRET, options);
  }

  async login(identifier: string, password: string): Promise<AuthResponse> {
    const user = await this.verifyCredentials(identifier, password);

    if (!user) {
      throw new ApiError(401, '❌ Clave incorrecta, inténtalo otra vez mi amor ❤️');
    }
    const token = this.generateToken(user);

    return {
      token,
      expiresIn: env.JWT_EXPIRATION,
      user
    };
  }

  verifyToken(token: string): AuthUser {
    try {
      const payload = jwt.verify(token, env.JWT_SECRET) as jwt.JwtPayload & AuthTokenPayload;
      if (!payload?.sub) {
        throw new ApiError(401, 'Token inválido');
      }

      return {
        id: payload.sub,
        role: payload.role ?? 'user',
        email: payload.email ?? env.ADMIN_EMAIL,
        username: payload.username ?? env.ADMIN_USERNAME
      };
    } catch (error) {
      throw new ApiError(401, 'Token inválido o expirado', error);
    }
  }
}

export const authService = new AuthService();
