# @repo/config

공유 설정 패키지 - Auth, gRPC, Config 등의 설정을 중앙에서 관리합니다.

## 📦 설치

```bash
# 각 앱에서 설치
pnpm add @repo/config --filter <app-name>
```

## ⚙️ ConfigModule (환경별 설정 관리)

환경에 따라 자동으로 설정 소스를 선택합니다:
- **로컬 환경**: `.env` 파일 사용
- **프로덕션 환경**: Kubernetes가 주입한 환경 변수 사용 (Vault Agent Injector 등)

### 사용법

```typescript
// app.module.ts
import { ConfigModule } from '@repo/config/config';

@Module({
  imports: [
    // 로컬: .env 파일 사용
    // 프로덕션: Kubernetes가 주입한 환경 변수 사용
    ConfigModule.forRoot(),
  ],
})
export class AppModule {}
```

### 환경별 동작

- **로컬 환경** (`NODE_ENV !== 'production'`):
  - 프로젝트 루트의 `.env`, `.env.local` 파일 자동 로드
  - `envFilePath` 옵션으로 커스텀 경로 지정 가능

- **프로덕션 환경** (`NODE_ENV === 'production'`):
  - Kubernetes가 주입한 환경 변수 사용
  - Vault Agent Injector 또는 External Secrets Operator 사용 권장
  - 애플리케이션 코드 변경 불필요

### 커스텀 설정

```typescript
ConfigModule.forRoot({
  envFilePath: ['.env.local', '.env.development'], // 커스텀 .env 파일 경로
  envKey: 'NODE_ENV',                             // 환경 변수 이름 (기본값: 'NODE_ENV')
  productionValue: 'production',                  // 프로덕션 값 (기본값: 'production')
  envFileExtensions: ['', '.local'],               // .env 파일 확장자
})
```

### 서비스에서 사용

```typescript
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MyService {
  constructor(private readonly configService: ConfigService) {}

  getDatabaseUrl() {
    // 로컬: .env 파일에서 읽음
    // 프로덕션: Kubernetes가 주입한 환경 변수에서 읽음
    return this.configService.get<string>('DATABASE_URL');
  }
}
```

### Kubernetes Vault 설정

Kubernetes 환경에서 Vault를 사용하려면 Vault Agent Injector 또는 External Secrets Operator를 설정하세요.
자세한 내용은 [VAULT_SETUP.md](./VAULT_SETUP.md)를 참고하세요.

## 🔐 AuthModule

JWT 인증 설정을 제공합니다.

### 사용법

```typescript
// app.module.ts
import { AuthModule } from '@repo/config/auth';

@Module({
  imports: [
    // 동기 방식
    AuthModule.forRoot({
      secret: process.env.JWT_SECRET,
      expiresIn: '1h',
    }),
    
    // 또는 비동기 방식 (ConfigService 사용)
    AuthModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get('JWT_SECRET'),
        signOptions: {
          expiresIn: config.get('JWT_EXPIRES_IN', '1h'),
        },
      }),
    }),
  ],
})
export class AppModule {}
```

### 서비스에서 사용

```typescript
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(private readonly jwtService: JwtService) {}

  async generateToken(userId: string) {
    return this.jwtService.sign({ userId });
  }

  async verifyToken(token: string) {
    return this.jwtService.verify(token);
  }
}
```

## 🔌 GrpcModule

여러 마이크로서비스와 gRPC 통신을 위한 클라이언트를 등록합니다.

### 사용법

#### API Gateway (여러 서비스와 통신)

```typescript
// app.module.ts
import { GrpcModule } from '@repo/config/grpc';

@Module({
  imports: [
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
    ]),
  ],
})
export class AppModule {}
```

#### 마이크로서비스 (필요한 서비스만)

```typescript
// app.module.ts
import { GrpcModule } from '@repo/config/grpc';

@Module({
  imports: [
    GrpcModule.forRoot({
      name: 'ORDER_SERVICE',
      url: process.env.ORDER_SERVICE_GRPC_URL || 'localhost:5002',
      protoPath: 'proto/order.proto',
      packageName: 'order',
    }),
  ],
})
export class AppModule {}
```
