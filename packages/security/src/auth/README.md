# AUTH Package vs Service

- auth 패키지 = 재사용 가능한 인증 인프라/공용 보안 도구
- auth 서비스 = 실제 인증 비즈니스 로직을 수행하는 도메인 서비스

## auth 패키지가 맡을 것

packages/security 같은 패키지는 앱이 직접 구현해야 할 “정책”이 아니라, 여러 앱에서 공통으로 쓰는 “도구” 쪽이 맞습니다.

### 여기에 두면 좋은 것

- AuthModule 같은 JwtModule 래퍼
- JwtAuthGuard
- @Public(), @Private()
- @CurrentUser()
- ALS 컨텍스트 헬퍼
- JWT verify/sign에 필요한 공용 유틸
  즉
- “토큰을 어떻게 검증할지”
- “컨트롤러에서 현재 유저를 어떻게 꺼낼지”
- “요청 컨텍스트를 어떻게 전파할지”
  이런 공통 인프라를 넣습니다.

## auth 서비스가 맡을 것

### 여기에 두면 좋은 것

- 로그인
- 로그아웃
- access token 발급
- refresh token 발급/재발급
- refresh token 폐기
- 비밀번호 검증
- 토큰 회전(rotation)
- 필요하면 이메일/비밀번호 기반 인증

즉

- “누가 로그인할 수 있나”
- “어떤 토큰을 발급할 것인가”
- “refresh token을 저장/폐기할 것인가”
  같은 업무 규칙이 들어갑니다.

## 경계 기준

```mermaid
flowchart LR
  Client --> Gateway
  Gateway -->|JWT 검증| SecurityPkg[@repo/security]
  Gateway -->|로그인/갱신 요청| AuthService[apps/auth]
  AuthService -->|토큰 발급| SecurityPkg
  AuthService -->|유저 검증| UserService[apps/user]
```

security 패키지: “인증을 어떻게 처리하는지”
auth 서비스: “인증을 무엇에 대해 수행하는지”
