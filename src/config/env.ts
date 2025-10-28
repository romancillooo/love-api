// love-api/src/config/env.ts
import { config as loadEnv } from 'dotenv';
import { z } from 'zod';

loadEnv();

const envSchema = z
  .object({
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
    PORT: z.coerce.number().int().positive().default(3000),

    // --- Database ---
    MONGO_URI: z.string().min(1, 'MONGO_URI is required'),

    // --- Auth ---
    JWT_SECRET: z.string().min(10, 'JWT_SECRET must be at least 10 characters'),
    JWT_EXPIRATION: z.string().default('12h'),

    // --- Admin ---
    ADMIN_EMAIL: z.string().email('ADMIN_EMAIL must be a valid email').default('amor@example.com'),
    ADMIN_USERNAME: z.string().min(3, 'ADMIN_USERNAME must have at least 3 characters').default('amor'),
    ADMIN_PASSWORD: z.string().optional(),
    ADMIN_PASSWORD_HASH: z.string().optional(),

    // --- Google Cloud Storage ---
    GCS_PROJECT_ID: z.string().min(1, 'GCS_PROJECT_ID is required'),
    GCS_BUCKET_NAME: z.string().min(1, 'GCS_BUCKET_NAME is required'),
    GCS_KEY_FILE: z.string().optional(), // Opcional en producción (usa Application Default Credentials)
  })
  .superRefine((value, ctx) => {
    if (!value.ADMIN_PASSWORD && !value.ADMIN_PASSWORD_HASH) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Provide ADMIN_PASSWORD or ADMIN_PASSWORD_HASH for authentication'
      });
    }
  });

export type Env = z.infer<typeof envSchema>;
export const env: Env = envSchema.parse(process.env);
export const isProduction = env.NODE_ENV === 'production';
