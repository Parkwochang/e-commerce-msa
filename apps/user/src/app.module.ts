import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { LoggerModule, TraceInterceptor } from '@repo/logger';
import { AuthModule } from '@repo/config/auth';
import { UserModule } from './user/user.module';

@Module({
  imports: [
    // Winston 로거 모듈 등록
    LoggerModule.forRoot({
      serviceName: 'USER_SERVICE',
      disableFileLog: process.env.NODE_ENV !== 'production', // production에서만 파일 로그 활성화
    }),
    AuthModule.forRoot({
      secret:
        process.env.JWT_SECRET || 'default-secret-key-change-in-production',
      expiresIn: '1h',
    }),
    // Feature Modules (gRPC 컨트롤러들)
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
