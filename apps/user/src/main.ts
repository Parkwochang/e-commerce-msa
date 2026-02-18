import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

import { PROTO_PATHS } from '@repo/proto';
import { WINSTON_MODULE_NEST_PROVIDER } from '@repo/logger';

import { AppModule } from './app.module';

async function bootstrap() {
  // Hybrid Application: HTTP + gRPC
  const app = await NestFactory.create(AppModule);

  app.useLogger(app.get(WINSTON_MODULE_NEST_PROVIDER));

  // gRPC Microservice 연결
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.GRPC,
    options: {
      package: 'user',
      protoPath: PROTO_PATHS.USER,
      url: process.env.GRPC_URL || '0.0.0.0:5001',
      loader: {
        keepCase: true,
        longs: String,
        enums: String,
        defaults: true,
        oneofs: true,
      },
    },
  });

  // gRPC 서버 시작
  await app.startAllMicroservices();

  Logger.log('✅ gRPC Server is running on: 0.0.0.0:5001');

  // HTTP 서버 (헬스체크, 메트릭 등을 위해)
  const httpPort = process.env.HTTP_PORT ?? 4001;
  await app.listen(httpPort);

  Logger.log(`🚀 HTTP Server is running on: http://localhost:${httpPort}`);
}

bootstrap();
