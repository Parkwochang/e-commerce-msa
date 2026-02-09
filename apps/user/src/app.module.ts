import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { LoggerModule, TraceInterceptor } from '@repo/logger';
import { UserModule } from './user/user.module';

@Module({
  imports: [
    LoggerModule.forRoot({
      serviceName: 'USER_SERVICE',
      disableFileLog: process.env.NODE_ENV !== 'production', // production에서만 파일 로그 활성화 -> 쿠베용이므로 파일 로그 사용 x
    }),
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
