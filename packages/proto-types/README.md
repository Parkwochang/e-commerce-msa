# @repo/proto-types

모든 마이크로서비스의 gRPC Protocol Buffer 정의와 생성된 TypeScript 타입을 중앙에서 관리하는 패키지입니다.

## 📦 구조

```
proto-types/
├── proto/              # Protocol Buffer 정의 파일
│   ├── user.proto
│   ├── order.proto
│   └── product.proto
├── src/
│   ├── generated/      # 자동 생성된 TypeScript 파일
│   └── index.ts        # 공개 API
└── scripts/
    └── generate-proto.sh
```

## 🚀 사용법

### 사전 준비: protoc 설치

```bash
# macOS
brew install protobuf

# Ubuntu/Debian
sudo apt-get install -y protobuf-compiler

# Windows
choco install protoc

# 설치 확인
protoc --version
```

### Proto 파일에서 TypeScript 생성

```bash
cd packages/proto-types
pnpm generate
```

### 패키지 빌드

```bash
pnpm build
```

### 서비스에서 사용

```typescript
// User 서비스 타입 임포트
import { 
  UserServiceClient, 
  CreateUserRequest,
  UserResponse 
} from '@repo/proto-types/user';

// Order 서비스 타입 임포트
import { 
  OrderServiceClient,
  CreateOrderRequest 
} from '@repo/proto-types/order';
```

## 🔄 워크플로우

1. **Proto 파일 수정**: `proto/*.proto` 파일 수정
2. **타입 생성**: `pnpm generate` 실행
3. **빌드**: `pnpm build` 실행 (또는 turborepo가 자동으로 처리)
4. **사용**: 각 서비스에서 생성된 타입 사용

## 📝 새로운 서비스 추가

1. `proto/` 디렉토리에 새 `.proto` 파일 추가
2. `package.json`의 `exports`에 새 엔트리 포인트 추가
3. `src/index.ts`에서 export 추가
4. `pnpm generate && pnpm build` 실행

## ⚡ Turborepo 캐싱

- Proto 파일이 변경되지 않으면 캐시된 빌드 사용
- 실제로 타입이 변경될 때만 의존하는 서비스가 재빌드됨

