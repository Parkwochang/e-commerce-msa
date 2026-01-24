import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { LoggerModule, TraceInterceptor } from '@repo/logger';
import { AuthModule } from '@repo/config/auth';
import { GrpcModule } from '@repo/config/grpc';
import { UserModule } from './user/user.module';
// import { OrderModule } from './order/order.module';
import { join } from 'path';
import { existsSync } from 'fs';

// Proto 파일 경로를 찾는 함수
function findProtoPath(filename: string): string {
  const possiblePaths = [
    join(process.cwd(), 'proto', filename), // 현재 작업 디렉토리
    join(__dirname, '../proto', filename), // dist 기준
    join(__dirname, '../../proto', filename), // src 기준
  ];

  for (const path of possiblePaths) {
    if (existsSync(path)) {
      console.log(`✅ Found proto file: ${path}`);
      return path;
    }
  }

  throw new Error(
    `Proto file not found: ${filename}. Tried paths: ${possiblePaths.join(', ')}`,
  );
}

@Module({
  imports: [
    // Winston 로거 모듈 등록
    LoggerModule.forRoot({
      serviceName: 'API_GATEWAY',
      disableFileLog: process.env.NODE_ENV !== 'production', // production에서만 파일 로그 활성화
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
        protoPath: findProtoPath('user.proto'),
        packageName: 'user',
      },
      // {
      //   name: 'ORDER_SERVICE',
      //   url: process.env.ORDER_SERVICE_GRPC_URL || 'localhost:5002',
      //   protoPath: 'proto/order.proto',
      //   packageName: 'order',
      // },
      // {
      //   name: 'PRODUCT_SERVICE',
      //   url: process.env.PRODUCT_SERVICE_GRPC_URL || 'localhost:5003',
      //   protoPath: 'proto/product.proto',
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
