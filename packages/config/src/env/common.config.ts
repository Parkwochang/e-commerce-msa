import z from 'zod';
import { registerAs } from '@nestjs/config';
import type { JwtSignOptions } from '@nestjs/jwt';

// ----------------------------------------------------------------------------
// prettier-ignore

const CommonConfigSchema = z.object({
  JWT_EXPIRES_IN  : z.string().transform((val) => val as JwtSignOptions['expiresIn']),
  JWT_SECRET      : z.string(),
  REDIS_HOST      : z.string(),
  REDIS_PORT      : z.string().transform(Number),
});

// ----------------------------------------------------------------------------
// prettier-ignore

export const COMMON_CONFIG = registerAs('common', () => {
  return CommonConfigSchema.parse({
    JWT_EXPIRES_IN  : process.env.JWT_EXPIRES_IN,
    JWT_SECRET      : process.env.JWT_SECRET,
    REDIS_HOST      : process.env.REDIS_HOST,
    REDIS_PORT      : process.env.REDIS_PORT,
  });
});

export type CommonConfigType = z.output<typeof CommonConfigSchema>;
