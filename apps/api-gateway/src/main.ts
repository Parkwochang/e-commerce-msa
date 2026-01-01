import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { WINSTON_MODULE_NEST_PROVIDER } from '@repo/logger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Winston을 NestJS 기본 로거로 설정
  app.useLogger(app.get(WINSTON_MODULE_NEST_PROVIDER));

  const port = process.env.PORT ?? 3000;
  await app.listen(port);

  console.log(`🚀 Application is running on: http://localhost:${port}`);
}
bootstrap();
