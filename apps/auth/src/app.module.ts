import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';

import { LoggerModule, TraceInterceptor } from '@repo/logger';
import { ConfigModule } from '@repo/config/config';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    // 환경별 설정 관리
    // - 로컬: .env 파일 사용
    // - 프로덕션: Kubernetes가 주입한 환경 변수 사용 (Vault Agent Injector)
    ConfigModule.forRoot(),
    LoggerModule.forRoot({
      serviceName: 'AUTH_SERVICE',
      disableFileLog: process.env.NODE_ENV === 'production',
    }),
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
