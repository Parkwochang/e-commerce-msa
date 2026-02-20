# nestjs-zod 사용 가이드

`nestjs-zod`는 주로 **DTO 검증**에 사용되지만, Config와 함께 사용하는 방법도 있습니다.

## nestjs-zod란?

- NestJS와 Zod를 완전히 통합하는 라이브러리
- DTO 클래스를 Zod 스키마로부터 자동 생성
- 자동 타입 추론 및 검증

## 사용 시나리오

### 1. DTO 검증 (주 사용 목적) ⭐

`nestjs-zod`는 주로 API 요청/응답 DTO 검증에 사용됩니다.

```typescript
// user.dto.ts
import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

// Zod 스키마 정의
const CreateUserSchema = z.object({
  email: z.string().email('Invalid email format'),
  name: z.string().min(1, 'Name is required'),
  age: z.number().int().min(18).optional(),
});

// DTO 클래스 자동 생성
export class CreateUserDto extends createZodDto(CreateUserSchema) {}

// Controller에서 사용
@Controller('users')
export class UserController {
  @Post()
  create(@Body() dto: CreateUserDto) {
    // 자동으로 검증됨 (ValidationPipe 필요)
    return this.userService.create(dto);
  }
}
```

### 2. Config와 함께 사용 (제한적)

Config의 경우 `registerAs + Zod`가 더 적합하지만, `nestjs-zod`를 사용할 수도 있습니다.

```typescript
// database.config.ts
import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';
import { registerAs } from '@nestjs/config';

const DatabaseConfigSchema = z.object({
  url: z.string().url(),
});

// DTO 클래스 생성 (Config에서는 거의 사용 안 함)
export class DatabaseConfigDto extends createZodDto(DatabaseConfigSchema) {}

// registerAs와 함께 사용 (일반적인 방식)
export default registerAs('database', () => {
  return DatabaseConfigSchema.parse({
    url: process.env.DATABASE_URL,
  });
});
```

## 비교: registerAs + Zod vs nestjs-zod

### registerAs + Zod (Config에 적합) ⭐

```typescript
import { z } from 'zod';
import { registerAs } from '@nestjs/config';

const DatabaseConfigSchema = z.object({
  url: z.string().url(),
});

export type DatabaseConfig = z.infer<typeof DatabaseConfigSchema>;

export default registerAs('database', (): DatabaseConfig => {
  return DatabaseConfigSchema.parse({
    url: process.env.DATABASE_URL,
  });
});
```

**장점:**

- ✅ Config에 최적화
- ✅ 타입 추론 자동
- ✅ 간단하고 직관적

### nestjs-zod (DTO에 적합) ⭐

```typescript
import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

const CreateUserSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1),
});

export class CreateUserDto extends createZodDto(CreateUserSchema) {}
```

**장점:**

- ✅ DTO 클래스 자동 생성
- ✅ NestJS ValidationPipe와 완벽 통합
- ✅ Swagger 문서 자동 생성 가능

## 실제 사용 예시

### DTO 검증 (권장 사용법)

```typescript
// dto/create-user.dto.ts
import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

const CreateUserSchema = z.object({
  email: z.string().email('Invalid email format'),
  name: z.string().min(1, 'Name is required'),
  age: z.number().int().min(18).max(120).optional(),
});

export class CreateUserDto extends createZodDto(CreateUserSchema) {}

// controller.ts
import { Controller, Post, Body } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';

@Controller('users')
export class UserController {
  @Post()
  create(@Body() dto: CreateUserDto) {
    // 자동 검증됨
    return this.userService.create(dto);
  }
}

// main.ts - ValidationPipe 설정
import { ValidationPipe } from '@nestjs/common';

app.useGlobalPipes(
  new ValidationPipe({
    transform: true,
    whitelist: true,
    forbidNonWhitelisted: true,
  }),
);
```

### Config (registerAs + Zod 권장)

```typescript
// config/database.config.ts
import { z } from 'zod';
import { registerAs } from '@nestjs/config';

const DatabaseConfigSchema = z.object({
  url: z.string().url(),
});

export type DatabaseConfig = z.infer<typeof DatabaseConfigSchema>;

export default registerAs('database', (): DatabaseConfig => {
  return DatabaseConfigSchema.parse({
    url: process.env.DATABASE_URL,
  });
});
```

## 결론

### Config 관리: **registerAs + Zod** ⭐

- Config는 `registerAs + Zod`가 더 적합
- 간단하고 직관적
- 타입 안전성 + 런타임 검증

### DTO 검증: **nestjs-zod** ⭐

- API 요청/응답 DTO는 `nestjs-zod` 사용
- NestJS와 완벽 통합
- ValidationPipe와 자동 연동

## 추천 구조

```
packages/config/
  src/config/
    database.config.ts      # registerAs + Zod (Config)
    redis.config.ts         # registerAs + Zod (Config)
    jwt.config.ts           # registerAs + Zod (Config)

apps/api-gateway/
  src/user/
    dto/
      create-user.dto.ts    # nestjs-zod (DTO)
      update-user.dto.ts    # nestjs-zod (DTO)
```

**요약:**

- **Config**: `registerAs + Zod` 사용
- **DTO**: `nestjs-zod` 사용
- 각각의 목적에 맞게 사용하는 것이 최선입니다!
