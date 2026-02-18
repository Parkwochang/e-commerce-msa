### 실행 CLI

```bash
pnpm build                    # 전체 빌드
APP=payment pnpm build:app    #서비스 부분 빌드
SCOPE=payment pnpm run prune  #배포용 경량화 파일 추출
```

### 최상위 Monorepo 구조

```bash
root
├── apps/                # 실제 실행되는 서비스들
│   ├── api-gateway/     # 외부 진입점 (HTTP)
│   ├── auth/            # 인증 서비스
│   ├── user/            # 유저 서비스
│   ├── order/           # 주문 서비스
│   ├── payment/         # 결제 서비스
│   └── notification/    # 알림 서비스
│
├── packages/            # 공유 라이브러리
│   ├── proto/           # gRPC proto 정의
│   ├── config/          # 공통 config (env, grpc option)
│   ├── logger/          # winston, pino 등
│   ├── errors/          # 공통 에러 규약
│   ├── interceptors/    # logging, timeout, tracing
│   ├── constants/
│   └── utils/
│
├── infra/               # 배포/인프라
│   ├── k8s/
│   ├── docker/
│   └── helm/
│
├── turbo.json | nx.json
├── package.json
└── tsconfig.base.json

```
