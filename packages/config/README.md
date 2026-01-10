# @repo/config

공유 설정 패키지 - Auth, gRPC 등의 설정을 중앙에서 관리합니다.

## 📦 설치

```bash
# 각 앱에서 설치
pnpm add @repo/config --filter <app-name>
```

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
// order-service/app.module.ts
import { GrpcModule } from '@repo/config/grpc';

@Module({
  imports: [
    // 단일 클라이언트
    GrpcModule.forRoot({
      name: 'USER_SERVICE',
      url: process.env.USER_SERVICE_GRPC_URL || 'localhost:5001',
      protoPath: 'proto/user.proto',
      packageName: 'user',
    }),
  ],
})
export class AppModule {}
```

### 컨트롤러에서 사용

```typescript
import { Controller, Get, Inject, OnModuleInit } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { Observable } from 'rxjs';

// proto 파일과 일치하는 인터페이스 정의
interface UserService {
  findOne(data: { id: string }): Observable<any>;
  findAll(data: {}): Observable<any>;
}

@Controller('users')
export class UserController implements OnModuleInit {
  private userService: UserService;

  constructor(
    @Inject('USER_SERVICE') private readonly client: ClientGrpc,
  ) {}

  onModuleInit() {
    // gRPC 서비스 초기화
    this.userService = this.client.getService<UserService>('UserService');
  }

  @Get()
  findAll() {
    return this.userService.findAll({});
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userService.findOne({ id });
  }
}
```

## 📝 환경 변수

### API Gateway (.env)

```bash
# JWT
JWT_SECRET=your-super-secret-key-at-least-32-characters-long
JWT_EXPIRES_IN=1h

# gRPC Microservices
USER_SERVICE_GRPC_URL=localhost:5001
ORDER_SERVICE_GRPC_URL=localhost:5002
PRODUCT_SERVICE_GRPC_URL=localhost:5003
```

### 마이크로서비스 (.env)

```bash
# JWT (같은 secret 사용)
JWT_SECRET=your-super-secret-key-at-least-32-characters-long

# 다른 마이크로서비스 (필요한 경우만)
USER_SERVICE_GRPC_URL=localhost:5001
```

## 🏗️ 아키텍처

```
[API Gateway:3000]
      ↓ gRPC
   ┌──┴──┬──────┬──────┐
   ↓     ↓      ↓      ↓
[User] [Order] [Product] [Payment]
:5001  :5002   :5003    :5004
```

- **API Gateway**: 모든 마이크로서비스와 통신 (여러 클라이언트)
- **각 마이크로서비스**: 필요한 서비스만 클라이언트로 등록 (예: Order → User, Product)

## 🎯 Best Practices

1. **환경 변수 검증**: `class-validator` 사용
2. **Proto 파일 공유**: `proto/` 디렉토리에 중앙 관리
3. **타입 정의**: gRPC 인터페이스를 각 서비스에서 정의
4. **에러 처리**: RxJS operators (`catchError`, `retry`) 활용
5. **로깅**: `@repo/logger` 패키지 사용

## 📚 더 알아보기

- [NestJS Microservices](https://docs.nestjs.com/microservices/basics)
- [gRPC Documentation](https://grpc.io/docs/)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)

