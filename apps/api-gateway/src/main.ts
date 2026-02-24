import { NestFactory } from '@nestjs/core';
import { VersioningType } from '@nestjs/common';

import { WINSTON_MODULE_NEST_PROVIDER } from '@repo/logger';
import { GATEWAY_CONFIG, type GatewayConfigType } from '@repo/config/env';

import { AppModule } from './app.module';

// ----------------------------------------------------------------------------

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const gatewayConfig = app.get<GatewayConfigType>(GATEWAY_CONFIG.KEY);

  if (!gatewayConfig) {
    throw new Error('Gateway config is required');
  }

  // Winston을 NestJS 기본 로거로 설정
  app.useLogger(app.get(WINSTON_MODULE_NEST_PROVIDER));

  app.enableCors({
    origin: ['http://localhost:3000', 'domain'],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    maxAge: 86400,
    credentials: true,
  });

  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  await app.listen(gatewayConfig.HTTP_PORT);

  console.log(
    `🚀 Application is running on: http://localhost:${gatewayConfig.HTTP_PORT}`,
  );
}
bootstrap();
