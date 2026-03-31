import z from 'zod';
import { createZodDto } from 'nestjs-zod/dto';

import type { AuthUserDto } from './auth-user.dto';

export interface LoginResultDto {
  user: AuthUserDto;
  accessToken: string;
  refreshToken: string;
}

const LoginInputSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(100),
});

const LoginResultSchema = z.object({
  // user: AuthUserDtoSchema,
  accessToken: z.string(),
  refreshToken: z.string(),
});

export class LoginInputDto extends createZodDto(LoginInputSchema) {}
