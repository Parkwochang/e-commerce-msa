import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
// pcakcage
import { LoggerModule, TraceInterceptor } from '@repo/logger';
import {
  ConfigModule,
  COMMON_CONFIG,
  type CommonConfigType,
} from '@repo/config/env';
import { AuthModule } from '@repo/config/auth';
import { HealthModule } from '@repo/config/health';

import { AppController } from '@/app.controller';
import { AppService } from '@/app.service';
import { UserModule } from '@/modules/user/user.module';

// ----------------------------------------------------------------------------

@Module({
  imports: [
    ConfigModule.forRoot({
      appType: 'api',
    }),

    LoggerModule.forRoot({
      serviceName: 'API_GATEWAY',
      disableFileLog: process.env.NODE_ENV === 'production',
    }),

    AuthModule.forRootAsync({
      inject: [COMMON_CONFIG.KEY],
      useFactory: (commonConfig: CommonConfigType) => ({
        secret: commonConfig.JWT_SECRET,
        expiresIn: commonConfig.JWT_EXPIRES_IN,
      }),
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
