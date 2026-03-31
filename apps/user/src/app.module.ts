import { Module } from '@nestjs/common';
import { APP_FILTER, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';

import { LoggerModule, TraceInterceptor } from '@repo/logger';
import { AppConfigModule, APP_CONFIG } from '@repo/config';
import { GrpcHealthModule } from '@repo/health';
import { GlobalGrpcExceptionFilter } from '@repo/errors';

import { UserModule } from './domains/user';
import { AppZodValidationPipe } from './common/pipe/dto.filter';

// ----------------------------------------------------------------------------

@Module({
  imports: [
    AppConfigModule.forRoot({
      appType: 'grpc',
    }),

    LoggerModule.forRoot({
      serviceName: 'USER_GRPC',
      fileLog: {
        enabled: process.env.NODE_ENV !== 'production',
      },
    }),

    GrpcHealthModule,

    // Feature Modules
    UserModule,
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: GlobalGrpcExceptionFilter,
    },
    {
      provide: APP_PIPE,
      useClass: AppZodValidationPipe,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: TraceInterceptor,
    },
  ],
})
export class AppModule {}
