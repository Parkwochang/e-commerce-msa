import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { requestContext, generateTraceId } from './trace.context';

/**
 * 모든 요청에 고유한 traceId를 할당하는 Interceptor
 *
 * @example
 * ```typescript
 * // app.module.ts
 * providers: [
 *   {
 *     provide: APP_INTERCEPTOR,
 *     useClass: TraceInterceptor,
 *   },
 * ]
 * ```
 */
@Injectable()
export class TraceInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();

    const traceId = request.headers['x-trace-id'] || generateTraceId();

    return new Observable((subscriber) => {
      // 동기 실행 컨텍스트에 traceId를 설정하여 전체 요청 생명주기 동안 사용
      requestContext.run({ traceId }, () => {
        next.handle().subscribe({
          next: (value) => subscriber.next(value),
          error: (error) => subscriber.error(error),
          complete: () => subscriber.complete(),
        });
      });
    });
  }
}
