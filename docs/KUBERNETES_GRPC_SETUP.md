# Kubernetes gRPC 서비스 URL 설정 가이드

Kubernetes 환경에서 gRPC 서비스 URL을 설정하는 방법입니다.

## 핵심 개념

### 서버 측 (마이크로서비스)

- **바인딩 주소**: `0.0.0.0:5001` (모든 네트워크 인터페이스에서 수신)
- **환경 변수**: `GRPC_URL=0.0.0.0:5001` (또는 생략 가능)

### 클라이언트 측 (API Gateway)

- **서비스 URL**: Kubernetes Service 이름 사용
- **형식**: `<service-name>.<namespace>.svc.cluster.local:<port>`
- **간단 형식**: `<service-name>:<port>` (같은 네임스페이스)

## Kubernetes Deployment 예시

### 1. User Service (gRPC 서버)

```yaml
# k8s/user-service/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: user-service
  namespace: e-commerce
spec:
  replicas: 3
  selector:
    matchLabels:
      app: user-service
  template:
    metadata:
      labels:
        app: user-service
    spec:
      containers:
        - name: user-service
          image: user-service:latest
          ports:
            - name: grpc
              containerPort: 5001
            - name: http
              containerPort: 4001
          env:
            # gRPC 서버는 0.0.0.0으로 바인딩 (모든 인터페이스)
            - name: GRPC_URL
              value: '0.0.0.0:5001'
            - name: HTTP_PORT
              value: '4001'
            - name: NODE_ENV
              value: 'production'
            # 다른 환경 변수들...
            - name: DATABASE_URL
              valueFrom:
                secretKeyRef:
                  name: user-service-secrets
                  key: database-url
---
apiVersion: v1
kind: Service
metadata:
  name: user-service
  namespace: e-commerce
spec:
  type: ClusterIP
  selector:
    app: user-service
  ports:
    - name: grpc
      port: 5001
      targetPort: 5001
      protocol: TCP
    - name: http
      port: 4001
      targetPort: 4001
      protocol: TCP
```

### 2. API Gateway (gRPC 클라이언트)

```yaml
# k8s/api-gateway/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: api-gateway
  namespace: e-commerce
spec:
  replicas: 2
  selector:
    matchLabels:
      app: api-gateway
  template:
    metadata:
      labels:
        app: api-gateway
    spec:
      containers:
        - name: api-gateway
          image: api-gateway:latest
          ports:
            - name: http
              containerPort: 3000
          env:
            - name: NODE_ENV
              value: 'production'
            # gRPC 클라이언트는 Kubernetes Service 이름 사용
            - name: USER_SERVICE_GRPC_URL
              value: 'user-service:5001' # 같은 네임스페이스
            # 또는 전체 FQDN
            # value: "user-service.e-commerce.svc.cluster.local:5001"
            - name: ORDER_SERVICE_GRPC_URL
              value: 'order-service:5002'
            - name: PRODUCT_SERVICE_GRPC_URL
              value: 'product-service:5003'
            # 다른 환경 변수들...
---
apiVersion: v1
kind: Service
metadata:
  name: api-gateway
  namespace: e-commerce
spec:
  type: LoadBalancer # 또는 NodePort, Ingress
  selector:
    app: api-gateway
  ports:
    - name: http
      port: 80
      targetPort: 3000
```

## 코드 개선

### 현재 코드 (개선 필요)

```typescript
// apps/user/src/main.ts
url: process.env.GRPC_URL || '0.0.0.0:5001',
```

### 개선된 코드 (ConfigService 사용)

```typescript
// apps/user/src/main.ts
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // ConfigService에서 가져오기 (또는 환경 변수 직접 사용)
  const grpcUrl = configService.get<string>('GRPC_URL', '0.0.0.0:5001');
  const httpPort = configService.get<number>('HTTP_PORT', 4001);

  app.connectMicroservice<MicroserviceOptions>(
    connectGrpcClient({
      name: 'USER_SERVICE',
      url: grpcUrl,
      protoPath: PROTO_PATHS.USER,
      packageName: 'user',
    }),
  );

  await app.startAllMicroservices();
  await app.listen(httpPort);
}
```

## 환경 변수 요약

### 서버 측 (마이크로서비스)

| 환경 변수   | 값             | 설명                      |
| ----------- | -------------- | ------------------------- |
| `GRPC_URL`  | `0.0.0.0:5001` | gRPC 서버 바인딩 주소     |
| `HTTP_PORT` | `4001`         | HTTP 서버 포트 (헬스체크) |

### 클라이언트 측 (API Gateway)

| 환경 변수                  | 값                     | 설명                      |
| -------------------------- | ---------------------- | ------------------------- |
| `USER_SERVICE_GRPC_URL`    | `user-service:5001`    | User Service gRPC 주소    |
| `ORDER_SERVICE_GRPC_URL`   | `order-service:5002`   | Order Service gRPC 주소   |
| `PRODUCT_SERVICE_GRPC_URL` | `product-service:5003` | Product Service gRPC 주소 |

## 네임스페이스별 설정

### 같은 네임스페이스

```yaml
env:
  - name: USER_SERVICE_GRPC_URL
    value: 'user-service:5001' # 간단한 형식
```

### 다른 네임스페이스

```yaml
env:
  - name: USER_SERVICE_GRPC_URL
    value: 'user-service.user-namespace.svc.cluster.local:5001' # FQDN
```

## ConfigMap 사용 (선택적)

환경 변수를 ConfigMap으로 관리할 수도 있습니다:

```yaml
# k8s/configmap.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: grpc-config
  namespace: e-commerce
data:
  USER_SERVICE_GRPC_URL: 'user-service:5001'
  ORDER_SERVICE_GRPC_URL: 'order-service:5002'
  PRODUCT_SERVICE_GRPC_URL: 'product-service:5003'
```

```yaml
# deployment.yaml
spec:
  template:
    spec:
      containers:
        - name: api-gateway
          envFrom:
            - configMapRef:
                name: grpc-config
```

## 주의사항

1. **서버는 항상 `0.0.0.0`**: Pod 내부에서 모든 인터페이스에 바인딩
2. **클라이언트는 Service 이름**: Kubernetes DNS를 통해 자동 해석
3. **포트 일치**: Service의 `port`와 Pod의 `containerPort` 일치 확인
4. **프로토콜**: gRPC는 TCP 프로토콜 사용

## 요약

- **서버**: `GRPC_URL=0.0.0.0:5001` (또는 생략)
- **클라이언트**: `USER_SERVICE_GRPC_URL=user-service:5001`
- **Kubernetes Service**: 같은 이름으로 생성 필요
