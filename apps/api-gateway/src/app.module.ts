import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { LoggerModule, TraceInterceptor } from '@repo/logger';
import { AuthModule } from '@repo/config/auth';
import { GrpcModule } from '@repo/config/grpc';
import { UserController } from './user/user.controller';
import { OrderController } from './order/order.controller';

@Module({
  imports: [
    // Winston 로거 모듈 등록
    LoggerModule.forRoot({
      serviceName: 'API_GATEWAY',
      disableFileLog: process.env.NODE_ENV === 'production', // 파일 로그 활성화
    }),
    AuthModule.forRoot({
      secret: process.env.JWT_SECRET,
      expiresIn: '1h',
    }),
    // gRPC 클라이언트 등록 (여러 마이크로서비스와 통신)
    GrpcModule.forRoot([
      {
        name: 'USER_SERVICE',
        url: process.env.USER_SERVICE_GRPC_URL || 'localhost:5001',
        protoPath: 'proto/user.proto',
        packageName: 'user',
      },
      {
        name: 'ORDER_SERVICE',
        url: process.env.ORDER_SERVICE_GRPC_URL || 'localhost:5002',
        protoPath: 'proto/order.proto',
        packageName: 'order',
      },
      {
        name: 'PRODUCT_SERVICE',
        url: process.env.PRODUCT_SERVICE_GRPC_URL || 'localhost:5003',
        protoPath: 'proto/product.proto',
        packageName: 'product',
      },
    ]),
  ],
  controllers: [AppController, UserController, OrderController],
  providers: [
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useClass: TraceInterceptor,
    },
  ],
})
export class AppModule {}
