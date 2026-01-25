# 🚀 Proto Types 패키지 설정 가이드

## 📦 설치 및 초기 설정

### 1. Protoc 설치 (필수)

```bash
# macOS
brew install protobuf

# Ubuntu/Debian
sudo apt-get install -y protobuf-compiler

# Windows
choco install protoc

# 설치 확인
protoc --version
# libprotoc 3.x 이상이면 OK
```

### 2. 의존성 설치

```bash
# 루트 디렉토리에서
pnpm install
```

### 3. Proto 타입 생성

```bash
# proto-types 패키지로 이동
cd packages/proto-types

# TypeScript 타입 생성
pnpm generate

# 패키지 빌드
pnpm build
```

또는 루트에서 한 번에:

```bash
pnpm --filter @repo/proto-types generate
pnpm --filter @repo/proto-types build
```

### 3. Protoc 설치 (필요한 경우)

```bash
# macOS
brew install protobuf

# Ubuntu/Debian
sudo apt-get install protobuf-compiler

# 설치 확인
protoc --version
```

## 🔧 사용 방법

### 서비스에서 타입 사용하기

```typescript
// User 서비스 타입 임포트
import { UserServiceClient, CreateUserRequest, UserResponse, FindOneRequest } from '@repo/proto-types';

// 또는 특정 서비스만
import { OrderServiceClient } from '@repo/proto-types';
```

### API Gateway에서 사용

```typescript
import { Injectable, Inject, OnModuleInit } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { Observable } from 'rxjs';
import { UserServiceClient, FindOneRequest, UserResponse } from '@repo/proto-types';

@Injectable()
export class UserGrpcService implements OnModuleInit {
  private userService!: UserServiceClient;

  constructor(@Inject('USER_SERVICE') private readonly client: ClientGrpc) {}

  onModuleInit() {
    this.userService = this.client.getService<UserServiceClient>('UserService');
  }

  findOne(id: string): Observable<UserResponse> {
    const request: FindOneRequest = { id };
    return this.userService.findOne(request);
  }
}
```

## 📝 Proto 파일 수정 워크플로우

### 1. Proto 파일 수정

```bash
# packages/proto-types/proto/ 디렉토리에서 .proto 파일 수정
vim packages/proto-types/proto/user.proto
```

### 2. 타입 재생성 및 빌드

```bash
cd packages/proto-types
pnpm generate  # TypeScript 타입 재생성
pnpm build     # 패키지 빌드
```

### 3. Turborepo가 자동으로 처리

- Proto 파일이 변경되지 않으면 → 캐시 사용 (빌드 안함)
- Proto 파일 변경됨 → `proto-types` 패키지만 재빌드
- 생성된 타입 변경됨 → 의존하는 서비스들만 재빌드

## 🎯 새로운 서비스 추가하기

### 1. Proto 파일 생성

```bash
# packages/proto-types/proto/shop.proto
vim packages/proto-types/proto/shop.proto
```

```protobuf
syntax = "proto3";

package shop;

service ShopService {
  rpc GetShop (GetShopRequest) returns (ShopResponse);
}

message GetShopRequest {
  string id = 1;
}

message ShopResponse {
  string id = 1;
  string name = 2;
}
```

### 2. package.json exports 추가

```json
{
  "exports": {
    "./shop": {
      "types": "./dist/shop.d.ts",
      "default": "./dist/shop.js"
    }
  }
}
```

### 3. src/index.ts에 export 추가

```typescript
export * from './generated/shop';
```

### 4. 생성 및 빌드

```bash
pnpm generate && pnpm build
```

## 🏗️ 프로젝트 구조

```
packages/proto-types/
├── proto/                  # Protocol Buffer 정의
│   ├── user.proto
│   ├── order.proto
│   └── product.proto
├── src/
│   ├── generated/          # 자동 생성된 TypeScript (git ignored)
│   │   ├── user.ts
│   │   ├── order.ts
│   │   └── product.ts
│   └── index.ts            # 공개 API
├── scripts/
│   └── generate-proto.sh   # 생성 스크립트
└── package.json
```

## ⚡ 빌드가 필요한가요?

**네, 하지만 효율적입니다!**

### Turborepo 캐싱 덕분에:

- ✅ Proto 파일 변경 안됨 → 캐시 사용 (0초)
- ✅ Proto만 변경 → `proto-types`만 빌드 (5~10초)
- ✅ 타입 실제 변경 → 의존 서비스만 재빌드

### 장점:

1. 🎯 **단일 진실의 원천**: 모든 proto가 한 곳에
2. 🔄 **버전 관리**: proto-types 패키지 버전으로 관리
3. 🚀 **타입 안정성**: TypeScript로 컴파일 타임 체크
4. 📦 **재사용성**: 모든 서비스에서 동일한 타입 사용
5. ⚡ **효율적 빌드**: Turborepo 캐싱으로 불필요한 빌드 최소화

## 🐛 트러블슈팅

### protoc not found

```bash
brew install protobuf  # macOS
```

### ts-proto not found

```bash
cd packages/proto-types
pnpm install
```

### 타입이 안 보여요

```bash
# proto-types 재빌드
cd packages/proto-types
pnpm build

# 또는 루트에서
pnpm --filter @repo/proto-types build
```

### 변경사항이 반영 안 돼요

```bash
# 캐시 클리어 후 재빌드
cd packages/proto-types
pnpm clean
pnpm build
```

## 📚 추가 리소스

- [Protocol Buffers 공식 문서](https://protobuf.dev/)
- [ts-proto GitHub](https://github.com/stephenh/ts-proto)
- [NestJS Microservices](https://docs.nestjs.com/microservices/grpc)
