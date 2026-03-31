import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';

import { LoggerModule, TraceInterceptor } from '@repo/logger';
import { AppConfigModule } from '@repo/config';
import { RedisModule } from '@repo/transport/redis';

import { InfraModule } from '@/infra/infra.module';
import { AuthModule } from '@/domains/auth';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    AppConfigModule.forRoot({
      appType: 'grpc',
    }),
    LoggerModule.forRoot({
      serviceName: 'AUTH_SERVICE',
      fileLog: {
        enabled: process.env.NODE_ENV !== 'production',
      },
    }),
    RedisModule.forRootAsync(),
    InfraModule,

    AuthModule,
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
