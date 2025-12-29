# @repo/logger

Winston 기반 NestJS 공유 로거 패키지

## 설치

```bash
pnpm add '@repo/logger@workspace:*'
```

## 사용법

### 1. 모듈 등록

```typescript
// main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Winston을 NestJS 기본 로거로 설정
  app.useLogger(app.get(WINSTON_MODULE_NEST_PROVIDER));

  await app.listen(3000);
}
bootstrap();
```

```typescript
// app.module.ts
import { Module } from '@nestjs/common';
import { LoggerModule } from '@repo/logger';

@Module({
  imports: [
    LoggerModule.forRoot({
      disableFileLog: false, // true면 콘솔에만 출력
    }),
  ],
})
export class AppModule {}
```

### 2. 서비스에서 사용

```typescript
import { Injectable } from '@nestjs/common';
import { LoggerService } from '@repo/logger';

@Injectable()
export class UserService {
  constructor(private readonly logger: LoggerService) {}

  async createUser(data: any) {
    this.logger.log('Creating user', 'UserService');

    try {
      // 로직...
      this.logger.info('User created successfully', 'UserService', { userId: data.id });
    } catch (error) {
      this.logger.error('Failed to create user', error.stack, 'UserService');
      throw error;
    }
  }
}
```

### 3. Winston 직접 사용

```typescript
import { Injectable, Inject } from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from '@repo/logger';
import { Logger } from 'winston';

@Injectable()
export class SomeService {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER)
    private readonly logger: Logger
  ) {}

  doSomething() {
    this.logger.info('Custom log', { customField: 'value' });
  }
}
```

## 로그 레벨

- `error`: 에러 로그
- `warn`: 경고 로그
- `info`: 정보 로그
- `http`: HTTP 요청 로그
- `verbose`: 상세 로그
- `debug`: 디버그 로그

## 환경 변수

```env
LOG_LEVEL=info          # 로그 레벨 설정 (기본값: info)
NODE_ENV=production     # test면 파일 로그 비활성화
```

## 로그 파일

- `logs/combined-YYYY-MM-DD.log`: 모든 로그
- `logs/error-YYYY-MM-DD.log`: 에러 로그만
- 일별 로테이션, 최대 14일 보관
- 20MB 이상 시 자동 압축
