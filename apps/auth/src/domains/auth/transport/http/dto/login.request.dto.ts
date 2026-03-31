import z from 'zod';
import { createZodDto } from 'nestjs-zod/dto';

const LoginRequestSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(100),
});

export class LoginRequestDto extends createZodDto(LoginRequestSchema) {}
