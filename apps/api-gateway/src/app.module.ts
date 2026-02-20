import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
// pcakcage
import { LoggerModule, TraceInterceptor } from '@repo/logger';
import { ConfigModule } from '@repo/config/env';
import { AuthModule } from '@repo/config/auth';
import { GrpcModule } from '@repo/config/grpc';
import { PROTO_PATHS } from '@repo/proto';

import { AppController } from '@/app.controller';
import { AppService } from '@/app.service';
import { UserModule } from '@/user/user.module';

// ----------------------------------------------------------------------------

@Module({
  imports: [
    // - 로컬: .env 파일 사용
    // - 프로덕션: Kubernetes가 주입한 환경 변수 사용 (Vault Agent Injector)
    ConfigModule.forRoot({
      appType: 'api',
    }),
    // Winston 로거 모듈 등록
    LoggerModule.forRoot({
      serviceName: 'API_GATEWAY',
      disableFileLog: process.env.NODE_ENV === 'production',
    }),
    AuthModule.forRoot({
      secret:
        process.env.JWT_SECRET || 'default-secret-key-change-in-production',
      expiresIn: '1h',
    }),
    // gRPC 클라이언트 등록 (여러 마이크로서비스와 통신)
    GrpcModule.forRoot([
      {
        name: 'USER_SERVICE',
        url: process.env.USER_SERVICE_GRPC_URL || 'localhost:5001',
        protoPath: PROTO_PATHS.USER,
        packageName: 'user',
      },
      // {
      //   name: 'ORDER_SERVICE',
      //   url: process.env.ORDER_SERVICE_GRPC_URL || 'localhost:5002',
      //   protoPath: PROTO_PATHS.ORDER,
      //   packageName: 'order',
      // },
      // {
      //   name: 'PRODUCT_SERVICE',
      //   url: process.env.PRODUCT_SERVICE_GRPC_URL || 'localhost:5003',
      //   protoPath: PROTO_PATHS.PRODUCT,
      //   packageName: 'product',
      // },
    ]),
    // Feature Modules
    UserModule,
    // OrderModule, // ORDER_SERVICE가 활성화되면 주석 해제
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
