# Observable Pattern과 AsyncLocalStorage

## 📚 목차

- [왜 new Observable이 필요한가?](#왜-new-observable이-필요한가)
- [외부/내부 Observable](#외부내부-observable)
- [실행 시점의 차이](#실행-시점의-차이)
- [대기(Waiting) 메커니즘](#대기waiting-메커니즘)
- [실전 예시](#실전-예시)

---

## 왜 new Observable이 필요한가?

### ❌ 문제: 직접 반환하면 컨텍스트 손실

```typescript
intercept(context: ExecutionContext, next: CallHandler) {
  const traceId = generateTraceId();

  requestContext.run({ traceId }, () => {
    return next.handle();  // Observable 반환
  });
  // ← run() 스코프가 여기서 끝남!

  // 나중에 NestJS가 subscribe할 때는 run() 스코프 밖!
}
```

**결과**: Controller, Service에서 `getTraceId()` → `undefined` ❌

### ✅ 해결: new Observable로 래핑

```typescript
intercept(context: ExecutionContext, next: CallHandler) {
  const traceId = generateTraceId();

  return new Observable((subscriber) => {
    // NestJS가 subscribe할 때 이 코드가 실행됨

    requestContext.run({ traceId }, () => {
      // run() 스코프 안에서 subscribe
      next.handle().subscribe({
        next: (value) => subscriber.next(value),
        error: (error) => subscriber.error(error),
        complete: () => subscriber.complete()
      });
      // 모든 비동기 작업이 run() 스코프 안에서 실행됨!
    });
  });
}
```

**결과**: Controller, Service에서 `getTraceId()` → `traceId` 값 ✅

---

## 외부/내부 Observable

### 구조 이해

```typescript
// 외부 Observable: 우리가 만든 것
return new Observable((subscriber) => {
  //   ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  //   NestJS가 이것을 subscribe

  // 내부 Observable: NestJS가 만든 것
  next.handle().subscribe({
    //^^^^^^^^^^^ Controller 실행

    // 내부에서 받은 데이터를 외부로 전달 (브릿지)
    next: (value) => subscriber.next(value),
  });
});
```

### 시각화

```
┌─────────────────────────────────────────────┐
│ 외부 Observable (new Observable)            │  ← NestJS가 subscribe
│                                              │
│  ┌───────────────────────────────────────┐  │
│  │ 내부 Observable (next.handle())       │  │  ← 우리가 subscribe
│  │                                        │  │
│  │  Controller → Service → Repository    │  │
│  │                                        │  │
│  └───────────────────────────────────────┘  │
│           ↓ subscriber.next(value)          │
│       외부로 데이터 전달                     │
└─────────────────────────────────────────────┘
         ↓
     NestJS가 받아서 응답 전송
```

### 역할: 브릿지(다리)

`new Observable`은 **내부 데이터를 받아서 외부로 전달하는 중간 다리** 역할을 합니다.

---

## 실행 시점의 차이

### pipe() vs subscribe()

```typescript
// pipe(): Observable 반환 (실행 안 됨)
const result$ = observable.pipe(map((x) => x * 2));
// 아직 아무것도 실행 안 됨! ⏸️

// subscribe(): 실제로 실행
result$.subscribe(); // 이제 실행! ▶️
```

### next.handle() 직접 반환

```typescript
intercept(context, next) {
  console.log('A');
  return next.handle();  // Observable 반환
  console.log('B');      // 실행됨
}

// 출력: A, B
// Controller는 나중에 실행 (NestJS가 subscribe할 때)
```

### next.handle().subscribe() (❌ 잘못된 방법)

```typescript
intercept(context, next) {
  console.log('A');

  next.handle().subscribe({  // ← 즉시 실행!
    next: () => console.log('C')
  });

  console.log('B');
  return ???;  // Subscription 객체 (타입 에러!)
}

// 출력: A, C, B
```

### new Observable (✅ 올바른 방법)

```typescript
intercept(context, next) {
  console.log('A');

  return new Observable((subscriber) => {
    console.log('D');  // NestJS가 subscribe할 때 실행
    next.handle().subscribe(subscriber);
  });

  console.log('B');
}

// 출력: A, B
// D는 NestJS가 subscribe할 때 출력
```

---

## 대기(Waiting) 메커니즘

### 핵심 개념

`new Observable + subscribe`를 `run()` 안에서 실행하면, `run()`이 API 요청이 완전히 끝날 때까지 **대기**합니다.

### 동기 vs 비동기 콜백

```typescript
// ❌ 동기 콜백: 즉시 종료
requestContext.run({ traceId }, () => {
  console.log('실행');
  // 함수 끝
});
// ← 즉시 컨텍스트 종료!

// ✅ 비동기 콜백: 대기
requestContext.run({ traceId }, () => {
  observable.subscribe({
    // 비동기 작업이 진행 중...
    complete: () => {
      // 이제 끝!
    },
  });
  // 함수는 끝났지만 subscribe가 완료될 때까지 대기! ⏳
});
```

### 타임라인

```
0ms:  요청 시작
1ms:  Interceptor: new Observable 생성
2ms:  NestJS: subscribe 호출
3ms:  run() 시작 ← 컨텍스트 생성 🟢
4ms:  next.handle().subscribe()
5ms:  Controller 실행 (컨텍스트 있음) ✅
10ms: Service 실행 (컨텍스트 있음) ✅
15ms: DB 쿼리 (컨텍스트 있음) ✅
20ms: 응답 생성 (컨텍스트 있음) ✅
21ms: complete() 호출
22ms: run() 종료 ← 컨텍스트 삭제 🔴
23ms: 응답 전송

→ 모든 작업(5ms~21ms)이 run() 안에서 실행됨!
```

### 식당 비유

```typescript
// ❌ 즉시 떠남
requestContext.run({ tableNumber: 5 }, () => {
  console.log('테이블 5번 예약');
});
// ← 식당을 떠남! 테이블 번호 잊어버림!

// ✅ 식사가 끝날 때까지 대기
return new Observable((waiter) => {
  requestContext.run({ tableNumber: 5 }, () => {
    orderFood().subscribe({
      // 음식을 주문하고
      // 음식이 나오고
      // 식사하고
      // 계산할 때까지 테이블에 앉아있음! ⏳
      complete: () => waiter.complete(),
    });
  });
});
```

---

## 실전 예시

### TraceInterceptor 구현

```typescript
@Injectable()
export class TraceInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const traceId = request.headers['x-trace-id'] || generateTraceId();

    // 새로운 Observable 생성 (외부)
    return new Observable((subscriber) => {
      // NestJS가 subscribe할 때 실행

      // AsyncLocalStorage 컨텍스트 시작
      requestContext.run({ traceId }, () => {
        // 내부 Observable subscribe
        next.handle().subscribe({
          next: (value) => subscriber.next(value), // 데이터 전달
          error: (error) => subscriber.error(error), // 에러 전달
          complete: () => subscriber.complete(), // 완료 신호
        });

        // subscribe가 완료될 때까지 run() 대기
      });
    });
  }
}
```

### 사용 예시

```typescript
@Controller()
export class OrderController {
  private readonly logger = new Logger(OrderController.name);

  @Post()
  async createOrder(@Body() dto: CreateOrderDto) {
    // TraceInterceptor가 traceId 설정

    this.logger.log('Creating order');
    // → [abc-123] [OrderController] info: Creating order

    const order = await this.orderService.create(dto);
    // Service 내부 로그도 같은 traceId 사용

    return order;
  }
}

@Injectable()
export class OrderService {
  private readonly logger = new Logger(OrderService.name);

  async create(dto: CreateOrderDto) {
    this.logger.log('Validating order');
    // → [abc-123] [OrderService] info: Validating order
    // 같은 traceId! ✅

    const order = await this.orderRepository.save(dto);
    // Repository 로그도 같은 traceId

    return order;
  }
}
```

---

## 요약

| 방법                        | 반환 타입       | 실행 시점     | AsyncLocalStorage | 용도                      |
| --------------------------- | --------------- | ------------- | ----------------- | ------------------------- |
| `next.handle()`             | Observable ✅   | Lazy (나중에) | ❌ 컨텍스트 손실  | 일반 Interceptor          |
| `next.handle().subscribe()` | Subscription ❌ | Eager (즉시)  | ❌ + 타입 에러    | 사용 금지                 |
| `new Observable()`          | Observable ✅   | Lazy (나중에) | ✅ 컨텍스트 유지  | AsyncLocalStorage 사용 시 |

### 핵심 포인트

1. **`new Observable`의 역할**: 내부와 외부를 연결하는 브릿지
2. **외부/내부**: 외부는 NestJS가 subscribe, 내부는 우리가 subscribe
3. **실행 시점**: `subscribe()`가 호출될 때 비로소 실행
4. **대기 메커니즘**: `run()` 안에서 subscribe하면 모든 작업이 끝날 때까지 컨텍스트 유지
5. **컨텍스트 유지**: API 요청의 시작부터 끝까지 traceId가 살아있음

이 패턴 덕분에 매개변수 전달 없이도 모든 레이어에서 traceId를 사용할 수 있습니다! 🎯
