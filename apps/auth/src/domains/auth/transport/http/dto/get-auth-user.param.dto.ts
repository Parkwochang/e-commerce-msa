import z from 'zod';
import { createZodDto } from 'nestjs-zod/dto';

const GetAuthUserParamSchema = z.object({
  email: z.string().email(),
});

export class GetAuthUserParamDto extends createZodDto(GetAuthUserParamSchema) {}
