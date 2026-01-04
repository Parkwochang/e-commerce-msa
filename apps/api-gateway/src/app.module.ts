import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { LoggerModule, TraceInterceptor } from '@repo/logger';

@Module({
  imports: [
    // Winston 로거 모듈 등록
    LoggerModule.forRoot({
      serviceName: 'api-gateway',
      disableFileLog: process.env.NODE_ENV === 'production', // 파일 로그 활성화
    }),
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
