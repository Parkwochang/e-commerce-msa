# ConfigModule 사용 가이드 (registerAs)

`registerAs`를 사용한 타입 안전한 설정 사용법입니다.

## 기본 사용법

```typescript
// app.module.ts
import { ConfigModule } from '@repo/config/config';

@Module({
  imports: [
    ConfigModule.forRoot(), // 모든 설정 자동 로드
  ],
})
export class AppModule {}
```

## 타입 안전한 설정 접근

### Database 설정

```typescript
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DatabaseConfig } from '@repo/config/config';

@Injectable()
export class PrismaService {
  constructor(private readonly configService: ConfigService) {
    // 타입 안전한 접근
    const dbConfig = this.configService.get<DatabaseConfig>('database');
    const databaseUrl = dbConfig.url;

    // 또는 직접 접근
    const url = this.configService.get<string>('database.url');
  }
}
```

### Redis 설정

```typescript
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RedisConfig } from '@repo/config/config';

@Injectable()
export class RedisService {
  constructor(private readonly configService: ConfigService) {
    const redisConfig = this.configService.get<RedisConfig>('redis');

    // 타입 안전한 접근
    const host = redisConfig.host;
    const port = redisConfig.port;
  }
}
```

### JWT 설정

```typescript
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtConfig } from '@repo/config/config';

@Injectable()
export class AuthService {
  constructor(private readonly configService: ConfigService) {
    const jwtConfig = this.configService.get<JwtConfig>('jwt');

    // 타입 안전한 접근
    const secret = jwtConfig.secret;
    const expiresIn = jwtConfig.expiresIn;
  }
}
```

### gRPC 설정

```typescript
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GrpcConfig } from '@repo/config/config';

@Injectable()
export class GrpcService {
  constructor(private readonly configService: ConfigService) {
    const grpcConfig = this.configService.get<GrpcConfig>('grpc');

    // 타입 안전한 접근
    const userServiceUrl = grpcConfig.userService?.url;
    const orderServiceUrl = grpcConfig.orderService?.url;
  }
}
```

### App 설정

```typescript
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppConfig } from '@repo/config/config';

@Injectable()
export class AppService {
  constructor(private readonly configService: ConfigService) {
    const appConfig = this.configService.get<AppConfig>('app');

    // 타입 안전한 접근
    const appName = appConfig.name;
    const port = appConfig.port;
    const env = appConfig.env;
  }
}
```

## 환경 변수 매핑

### Database

- `DATABASE_URL` → `database.url`

### Redis

- `REDIS_HOST` → `redis.host` (기본값: 'localhost')
- `REDIS_PORT` → `redis.port` (기본값: 6379)
- `REDIS_PASSWORD` → `redis.password`
- `REDIS_DB` → `redis.db`
- `REDIS_CONNECT_TIMEOUT` → `redis.connectTimeout` (기본값: 5000)

### JWT

- `JWT_SECRET` → `jwt.secret` (필수)
- `JWT_EXPIRES_IN` → `jwt.expiresIn` (기본값: '1h')
- `JWT_REFRESH_SECRET` → `jwt.refreshSecret`
- `JWT_REFRESH_EXPIRES_IN` → `jwt.refreshExpiresIn` (기본값: '7d')

### gRPC

- `USER_SERVICE_GRPC_URL` → `grpc.userService.url`
- `ORDER_SERVICE_GRPC_URL` → `grpc.orderService.url`
- `PRODUCT_SERVICE_GRPC_URL` → `grpc.productService.url`
- `AUTH_SERVICE_GRPC_URL` → `grpc.authService.url`
- `*_SERVICE_GRPC_TIMEOUT` → `grpc.*.timeout` (기본값: 5000)

### App

- `APP_NAME` → `app.name` (기본값: 'e-commerce-msa')
- `PORT` → `app.port` (기본값: 3000)
- `NODE_ENV` → `app.env` (기본값: 'development')
- `APP_VERSION` → `app.version`

## 커스텀 설정 추가

```typescript
// packages/config/src/config/custom.config.ts
import { registerAs } from '@nestjs/config';

export interface CustomConfig {
  apiKey: string;
  timeout: number;
}

export default registerAs('custom', (): CustomConfig => {
  return {
    apiKey: process.env.CUSTOM_API_KEY || '',
    timeout: parseInt(process.env.CUSTOM_TIMEOUT || '5000', 10),
  };
});
```

```typescript
// config.module.ts에 추가
import customConfig from './custom.config';

ConfigModule.forRoot({
  load: [appConfig, databaseConfig, customConfig], // 커스텀 설정 포함
});
```

## 장점

1. **타입 안전성**: TypeScript가 설정 구조를 인식
2. **자동완성**: IDE에서 설정 키 자동완성 지원
3. **중앙 관리**: 모든 설정을 한 곳에서 관리
4. **환경별 분리**: 로컬(.env) / 프로덕션(Kubernetes) 자동 처리
5. **검증**: 필수 설정 누락 시 런타임 에러로 빠른 발견
