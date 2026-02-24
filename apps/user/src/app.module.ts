import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';

import { LoggerModule, TraceInterceptor } from '@repo/logger';
import { ConfigModule } from '@repo/config/env';
import { HealthModule } from '@repo/config/health';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './modules/user/user.module';
import { GRPC_SERVICE } from '@repo/config/grpc';

// ----------------------------------------------------------------------------

@Module({
  imports: [
    ConfigModule.forRoot({
      appType: 'grpc',
    }),

    LoggerModule.forRoot({
      serviceName: GRPC_SERVICE.USER,
      disableFileLog: process.env.NODE_ENV === 'production',
    }),
    HealthModule,

    // Feature Modules
    UserModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useClass: TraceInterceptor,
    },
  ],
})
export class AppModule {}

// AuthModule.forRoot({
//   secret:
//     process.env.JWT_SECRET || 'default-secret-key-change-in-production',
//   expiresIn: '1h',
// }),
