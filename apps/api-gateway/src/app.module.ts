import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { LoggerModule } from '@repo/logger';

@Module({
  imports: [
    // Winston 로거 모듈 등록
    LoggerModule.forRoot({
      serviceName: 'api-gateway',
      disableFileLog: process.env.NODE_ENV === 'production', // 파일 로그 활성화
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
