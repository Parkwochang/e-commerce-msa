# API Gateway

E-commerce MSA의 API Gateway 서비스

## 설치 및 실행

```bash
# 의존성 설치 (루트에서)
pnpm install

# 개발 모드로 실행
pnpm --filter api-gateway start:dev

# 프로덕션 빌드
pnpm --filter api-gateway build
pnpm --filter api-gateway start:prod
```

## Logger 사용 예시

### 1. 기본 로그

```typescript
import { LoggerService } from '@repo/logger';

constructor(private readonly logger: LoggerService) {}

// 일반 로그
this.logger.log('User logged in', 'AuthService');

// 정보 로그 (메타데이터 포함)
this.logger.info('Order created', 'OrderService', {
  orderId: '12345',
  userId: 'user-1',
  total: 99.99
});
```

### 2. 에러 로그

```typescript
try {
  // 로직...
} catch (error) {
  this.logger.error(
    `Failed to process: ${error.message}`,
    error.stack,
    'ServiceName',
  );
  throw error;
}
```

### 3. 경고 로그

```typescript
if (quota > 90) {
  this.logger.warn('Quota almost exceeded', 'QuotaService');
}
```

### 4. 디버그 로그

```typescript
this.logger.debug('Cache hit', 'CacheService');
```

## API 엔드포인트

### GET /

Hello World 테스트

```bash
curl http://localhost:3000
```

### GET /health

헬스 체크

```bash
curl http://localhost:3000/health
```

**응답:**

```json
{
  "status": "ok",
  "memory": "45MB",
  "uptime": 123.45
}
```

### POST /data

데이터 처리 (로깅 예시)

```bash
curl -X POST http://localhost:3000/data \
  -H "Content-Type: application/json" \
  -d '{"name": "test", "value": 123}'
```

**응답:**

```json
{
  "success": true,
  "data": {
    "name": "test",
    "value": 123
  }
}
```

## 로그 파일

로그는 다음 위치에 저장됩니다:

- `logs/combined-YYYY-MM-DD.log` - 모든 로그
- `logs/error-YYYY-MM-DD.log` - 에러 로그만

## 환경 변수

`.env` 파일을 생성하세요:

```env
PORT=3000
LOG_LEVEL=info
NODE_ENV=development
```

## 로그 레벨

- `error` - 에러만
- `warn` - 경고 이상
- `info` - 정보 이상 (기본값)
- `http` - HTTP 요청
- `verbose` - 상세 로그
- `debug` - 디버그 로그 (모든 것)

예시:

```bash
LOG_LEVEL=debug pnpm start:dev
```
