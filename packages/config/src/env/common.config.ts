import z from 'zod';
import { registerAs } from '@nestjs/config';

// ----------------------------------------------------------------------------
// prettier-ignore

const CommonConfigSchema = z.object({
  JWT_EXPIRES_IN  : z.string(),
  JWT_SECRET      : z.string(),
  REDIS_HOST      : z.string(),
  REDIS_PORT      : z.string().transform(Number),
});

// ----------------------------------------------------------------------------
// prettier-ignore

export const COMMON_CONFIG = registerAs<z.output<typeof CommonConfigSchema>>('common', () => {
  return CommonConfigSchema.parse({
    JWT_EXPIRES_IN  : process.env.JWT_EXPIRES_IN,
    JWT_SECRET      : process.env.JWT_SECRET,
    REDIS_HOST      : process.env.REDIS_HOST,
    REDIS_PORT      : process.env.REDIS_PORT,
  });
});
