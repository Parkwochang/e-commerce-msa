# NestJS 설정 관리 방식 비교

## 1. registerAs (현재 방식) ⭐

### 장점

- ✅ **타입 안전성**: TypeScript 타입 체크
- ✅ **모듈화**: 각 설정을 독립적으로 관리
- ✅ **NestJS 표준**: 공식 문서 권장 패턴
- ✅ **재사용성**: 여러 모듈에서 쉽게 재사용
- ✅ **네임스페이스**: `config.get('database.url')` 형태로 접근

### 단점

- ❌ **런타임 검증 없음**: 타입만 체크, 값 검증은 수동
- ❌ **에러 발견이 늦음**: 앱 실행 시 에러 발생

### 예시

```typescript
export default registerAs('database', (): DatabaseConfig => {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error('DATABASE_URL is required'); // 수동 검증
  }
  return { url };
});
```

---

## 2. registerAs + Zod Validation (추천) ⭐⭐⭐

### 장점

- ✅ **타입 안전성**: TypeScript + Zod 스키마
- ✅ **런타임 검증**: 앱 시작 시 자동 검증
- ✅ **에러 메시지**: 명확한 검증 에러
- ✅ **기본값 처리**: Zod의 `.default()` 사용
- ✅ **변환**: `.transform()`으로 자동 타입 변환

### 단점

- ⚠️ **약간의 복잡도 증가**: Zod 스키마 작성 필요

### 예시

```typescript
import { z } from 'zod';
import { registerAs } from '@nestjs/config';

const DatabaseConfigSchema = z.object({
  url: z.string().url('DATABASE_URL must be a valid URL'),
  host: z.string().optional(),
  port: z.number().int().min(1).max(65535).optional(),
});

export type DatabaseConfig = z.infer<typeof DatabaseConfigSchema>;

export default registerAs('database', (): DatabaseConfig => {
  const result = DatabaseConfigSchema.parse({
    url: process.env.DATABASE_URL,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : undefined,
  });
  return result;
});
```

---

## 3. ConfigModule load 옵션 (단순 방식)

### 장점

- ✅ **간단함**: `registerAs` 없이 직접 객체 반환
- ✅ **빠른 구현**: 복잡한 구조 불필요

### 단점

- ❌ **타입 안전성 낮음**: 네임스페이스 없음
- ❌ **재사용 어려움**: 모듈별로 중복 작성
- ❌ **검증 없음**: 수동 검증 필요

### 예시

```typescript
ConfigModule.forRoot({
  load: [
    () => ({
      database: {
        url: process.env.DATABASE_URL,
      },
      redis: {
        host: process.env.REDIS_HOST,
      },
    }),
  ],
});
```

---

## 4. Class-based Config (고급)

### 장점

- ✅ **객체 지향**: 클래스로 관리
- ✅ **메서드 추가 가능**: 설정 관련 로직 포함

### 단점

- ❌ **복잡함**: 과도한 추상화
- ❌ **NestJS 비표준**: 커스텀 구현 필요

### 예시

```typescript
@Injectable()
export class DatabaseConfig {
  url = process.env.DATABASE_URL;

  getConnectionString() {
    return this.url;
  }
}
```

---

## 5. nestjs-zod (Zod 통합)

### 장점

- ✅ **완전한 통합**: NestJS + Zod 완벽 통합
- ✅ **DTO 클래스 자동 생성**: `createZodDto`로 DTO 클래스 생성
- ✅ **ValidationPipe 연동**: NestJS ValidationPipe와 자동 연동
- ✅ **타입 추론**: Zod 스키마에서 자동 타입 생성
- ✅ **Swagger 통합**: Swagger 문서 자동 생성 가능

### 단점

- ⚠️ **Config에는 과함**: Config에는 `registerAs + Zod`가 더 적합
- ⚠️ **DTO에 특화**: 주로 DTO 검증에 사용

### 예시

#### Config와 함께 사용 (제한적)

```typescript
import { createZodDto } from 'nestjs-zod';
import { registerAs } from '@nestjs/config';
import { z } from 'zod';

const DatabaseConfigSchema = z.object({
  url: z.string().url('DATABASE_URL must be a valid URL'),
});

// DTO 클래스 생성 (Config에서는 거의 사용 안 함)
export class DatabaseConfigDto extends createZodDto(DatabaseConfigSchema) {}

// registerAs와 함께 사용
export default registerAs('database', () => {
  return DatabaseConfigSchema.parse({
    url: process.env.DATABASE_URL,
  });
});
```

#### DTO 검증에 사용 (권장 사용법) ⭐

```typescript
// dto/create-user.dto.ts
import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const CreateUserSchema = z.object({
  email: z.string().email('Invalid email format'),
  name: z.string().min(1, 'Name is required'),
  age: z.number().int().min(18).optional(),
});

export class CreateUserDto extends createZodDto(CreateUserSchema) {}

// controller.ts
@Controller('users')
export class UserController {
  @Post()
  create(@Body() dto: CreateUserDto) {
    // 자동으로 검증됨 (ValidationPipe 필요)
    return this.userService.create(dto);
  }
}
```

---

## 추천 순위

### 1순위: **registerAs + Zod Validation** ⭐⭐⭐

- 타입 안전성 + 런타임 검증
- 프로젝트에 이미 Zod가 있음
- 가장 견고한 방식

### 2순위: **registerAs (현재)** ⭐⭐

- 타입 안전성은 있지만 검증은 수동
- 현재 방식이므로 마이그레이션 비용 낮음

### 3순위: **nestjs-zod**

- 더 나은 통합이지만 추가 학습 필요

---

## 마이그레이션 예시 (registerAs → registerAs + Zod)

```typescript
// Before (현재)
export default registerAs('database', (): DatabaseConfig => {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error('DATABASE_URL is required');
  }
  return { url };
});

// After (Zod 추가)
import { z } from 'zod';

const DatabaseConfigSchema = z.object({
  url: z.string().url('DATABASE_URL must be a valid URL'),
});

export type DatabaseConfig = z.infer<typeof DatabaseConfigSchema>;

export default registerAs('database', (): DatabaseConfig => {
  return DatabaseConfigSchema.parse({
    url: process.env.DATABASE_URL,
  });
});
```
