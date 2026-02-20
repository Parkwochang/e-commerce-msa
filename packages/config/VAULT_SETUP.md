# Kubernetes Vault 설정 가이드

Kubernetes 환경에서는 Vault Agent Injector를 사용하여 Pod에 자동으로 시크릿을 주입합니다.
애플리케이션 코드 변경 없이 환경 변수로 자동 주입됩니다.

## Vault Agent Injector 설정

### 1. Deployment에 Annotation 추가

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: auth-service
spec:
  template:
    metadata:
      annotations:
        # Vault Agent Injector 활성화
        vault.hashicorp.com/agent-inject: "true"
        # Vault 주소
        vault.hashicorp.com/role: "auth-service"
        # 주입할 시크릿 경로
        vault.hashicorp.com/agent-inject-secret-config: "secret/data/auth/config"
        # 환경 변수로 주입 (템플릿)
        vault.hashicorp.com/agent-inject-template-config: |
          {{- with secret "secret/data/auth/config" -}}
          {{- range $k, $v := .Data.data }}
          export {{ $k }}="{{ $v }}"
          {{- end }}
          {{- end }}
        # 추가 시크릿 경로
        vault.hashicorp.com/agent-inject-secret-database: "secret/data/auth/database"
        vault.hashicorp.com/agent-inject-template-database: |
          {{- with secret "secret/data/auth/database" -}}
          {{- range $k, $v := .Data.data }}
          export {{ $k }}="{{ $v }}"
          {{- end }}
          {{- end }}
    spec:
      containers:
        - name: auth-service
          image: auth-service:latest
          # 환경 변수는 자동으로 주입됨
```

### 2. External Secrets Operator 사용 (권장)

더 간단한 방법으로 External Secrets Operator를 사용할 수 있습니다:

```yaml
# ExternalSecret 리소스
apiVersion: external-secrets.io/v1beta1
kind: ExternalSecret
metadata:
  name: auth-secrets
spec:
  secretStoreRef:
    name: vault-backend
    kind: SecretStore
  target:
    name: auth-secrets
    creationPolicy: Owner
  data:
    - secretKey: DATABASE_URL
      remoteRef:
        key: secret/data/auth/config
        property: DATABASE_URL
    - secretKey: JWT_SECRET
      remoteRef:
        key: secret/data/auth/config
        property: JWT_SECRET
```

```yaml
# Deployment에서 Secret 사용
apiVersion: apps/v1
kind: Deployment
metadata:
  name: auth-service
spec:
  template:
    spec:
      containers:
        - name: auth-service
          image: auth-service:latest
          envFrom:
            - secretRef:
                name: auth-secrets
```

### 3. 애플리케이션 코드

애플리케이션은 단순히 환경 변수를 읽기만 하면 됩니다:

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

```typescript
// service.ts
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MyService {
  constructor(private readonly configService: ConfigService) {}

  getDatabaseUrl() {
    // Kubernetes가 주입한 환경 변수 또는 .env 파일에서 읽음
    return this.configService.get<string>('DATABASE_URL');
  }
}
```

## 장점

1. **코드 변경 불필요**: 애플리케이션 코드는 변경하지 않아도 됩니다
2. **자동 주입**: Kubernetes가 Pod 시작 시 자동으로 환경 변수 주입
3. **보안**: Vault 토큰이 애플리케이션에 노출되지 않음
4. **간단함**: 복잡한 Vault 클라이언트 로직 불필요

## 참고

- [Vault Agent Injector 문서](https://www.vaultproject.io/docs/platform/k8s/injector)
- [External Secrets Operator 문서](https://external-secrets.io/)
