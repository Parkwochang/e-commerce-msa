# 🛍️ E-Commerce Microservices Architecture

Turborepo 기반의 마이크로서비스 아키텍처 E-Commerce 플랫폼입니다.

## 📦 프로젝트 구조

### Apps (마이크로서비스)

- `api-gateway`: REST API Gateway - 클라이언트 요청을 각 마이크로서비스로 라우팅
- `user`: 사용자 관리 서비스 (gRPC)
- `order`: 주문 관리 서비스 (gRPC)
- `product`: 상품 관리 서비스 (gRPC)
- `shop`: 상점 관리 서비스 (gRPC)
- `benefit`: 혜택/쿠폰 서비스 (gRPC)
- `settlement`: 정산 서비스 (gRPC)

### Packages (공유 라이브러리)

- `@repo/proto-types`: gRPC Protocol Buffer 정의 및 TypeScript 타입 ⭐
- `@repo/logger`: 공통 로깅 시스템 (Winston + 분산 추적)
- `@repo/config`: 공통 설정 (gRPC, Auth 등)
- `@repo/auth`: 인증/인가 공통 로직
- `@repo/common`: 공통 유틸리티

### Tools

- `@repo/eslint-config`: ESLint 설정
- `@repo/typescript-config`: TypeScript 설정
- `@repo/prettier-config`: Prettier 설정

## 🚀 시작하기

### 1. 의존성 설치

```bash
pnpm install
```

### 2. Proto 타입 생성 (중요!)

```bash
# protoc 설치 (필요한 경우)
brew install protobuf  # macOS

# Proto 타입 생성
cd packages/proto-types
pnpm generate
pnpm build
```

또는 루트에서:

```bash
pnpm --filter @repo/proto-types generate
pnpm --filter @repo/proto-types build
```

> 📚 자세한 내용은 [PROTO_SETUP.md](./PROTO_SETUP.md)를 참고하세요.

### 3. 개발 모드 실행

```bash
# 모든 서비스 동시 실행
pnpm dev

# 특정 서비스만 실행
pnpm --filter api-gateway dev
pnpm --filter user-service dev
```

### 4. 빌드

```bash
# 모든 서비스 빌드
pnpm build

# 특정 서비스만 빌드
pnpm --filter api-gateway build
```

## 🏗️ 아키텍처

### gRPC 통신 구조

```
┌─────────────┐
│   Client    │
└──────┬──────┘
       │ HTTP/REST
       ▼
┌─────────────┐
│ API Gateway │
└──────┬──────┘
       │ gRPC
       ├─────────┐
       ▼         ▼
┌──────────┐  ┌──────────┐
│   User   │  │  Order   │  ...
│ Service  │  │ Service  │
└──────────┘  └──────────┘
```

### Proto Types 패키지 (@repo/proto-types) ⭐

모든 gRPC 서비스의 Protocol Buffer 정의를 중앙에서 관리합니다.

**장점:**

- 📝 단일 진실의 원천 (Single Source of Truth)
- 🔄 타입 안정성 보장
- ⚡ Turborepo 캐싱으로 효율적인 빌드
- 📦 모든 서비스에서 일관된 타입 사용

**사용 예시:**

```typescript
import { User, Order, Product } from '@repo/proto-types';

// 타입 사용
const client: User.UserServiceClient;
const request: User.CreateUserRequest = { ... };
```

## 📝 개발 워크플로우

### Proto 파일 수정 시

1. `packages/proto-types/proto/` 에서 .proto 파일 수정
2. `cd packages/proto-types && pnpm generate && pnpm build`
3. Turborepo가 변경된 부분만 자동으로 재빌드

### 새로운 서비스 추가 시

1. Proto 파일 작성: `packages/proto-types/proto/new-service.proto`
2. Proto 타입 생성: `cd packages/proto-types && pnpm generate && pnpm build`
3. 서비스 구현: `apps/new-service/`

## 🛠️ 사용 기술

- **Framework**: NestJS
- **RPC**: gRPC (@grpc/grpc-js)
- **Proto**: Protocol Buffers (ts-proto)
- **Database**: Prisma (예정)
- **Logging**: Winston
- **Validation**: Zod
- **Monorepo**: Turborepo + pnpm workspace

## 📚 문서

- [Proto Types 설정 가이드](./PROTO_SETUP.md)
- [Logger 패키지 문서](./packages/logger/README.md)
- [Config 패키지 문서](./packages/config/README.md)

## 🔥 유용한 명령어

```bash
# 전체 빌드
pnpm build

# 개발 모드 (모든 서비스)
pnpm dev

# 특정 서비스만 실행
pnpm --filter api-gateway dev
pnpm --filter user-service dev

# Proto 타입 재생성
pnpm --filter @repo/proto-types generate

# 린트 체크
pnpm lint

# 포맷팅
pnpm format

# 테스트
pnpm test
```

## 🐛 트러블슈팅

### proto-types를 찾을 수 없음

```bash
cd packages/proto-types
pnpm install
pnpm generate
pnpm build
```

### protoc not found

```bash
# macOS
brew install protobuf

# Ubuntu
sudo apt-get install protobuf-compiler
```

### 변경사항이 반영 안 됨

```bash
# Turborepo 캐시 클리어
rm -rf .turbo node_modules/.cache

# 재설치 및 빌드
pnpm install
pnpm build
```

## 📖 추가 자료

- [Turborepo 문서](https://turborepo.com/docs)
- [NestJS 마이크로서비스](https://docs.nestjs.com/microservices/grpc)
- [Protocol Buffers](https://protobuf.dev/)
- [gRPC 가이드](https://grpc.io/docs/)

## 👥 기여하기

1. Proto 파일 수정 시 반드시 문서화
2. 새로운 서비스 추가 시 README 업데이트
3. 공통 로직은 packages로 분리
4. 커밋 전 린트 및 테스트 실행

---

Built with ❤️ using Turborepo
