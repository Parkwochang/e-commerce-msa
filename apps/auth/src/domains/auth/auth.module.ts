import { Module } from '@nestjs/common';
import { APP_PIPE } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { CqrsModule } from '@nestjs/cqrs';
import { ZodValidationPipe } from 'nestjs-zod';

import {
  AUTH_USER_REPOSITORY,
  TOKEN_ISSUER,
  LoginHandler,
  GetAuthUserHandler,
} from '@/domains/auth/application';
import {
  InMemoryAuthUserRepository,
  JwtTokenIssuer,
} from '@/domains/auth/infra';
import { AuthController } from '@/domains/auth/transport';

@Module({
  imports: [
    CqrsModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET ?? 'auth-template-secret',
    }),
  ],
  controllers: [AuthController],
  providers: [
    LoginHandler,
    GetAuthUserHandler,
    {
      provide: AUTH_USER_REPOSITORY,
      useClass: InMemoryAuthUserRepository,
    },
    {
      provide: TOKEN_ISSUER,
      useClass: JwtTokenIssuer,
    },
    {
      provide: APP_PIPE,
      useClass: ZodValidationPipe,
    },
  ],
})
export class AuthModule {}
