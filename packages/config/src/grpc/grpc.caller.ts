import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { catchError, lastValueFrom, Observable, retry, timeout } from 'rxjs';
import * as CircuitBreaker from 'opossum';

// ----------------------------------------------------------------------------

interface GrpcCallerOptions {
  timeout?: number;
  retry?: number;
}

/**
 * gRPC 호출 래퍼 서비스
 * @description gRPC 호출을 래핑하여 예외 처리를 추가합니다. (서킷 브레이커 적용)
 * @param fn - gRPC 호출 함수
 * @param options - 옵션
 * @returns Promise<T>
 * @example
 * const caller = new GrpcCaller();
 * const result = await caller.call(() => grpcService.findAll());
 *
 * @example
 * const caller = new GrpcCaller();
 * const result = await caller.call(() => grpcService.findAll(), { timeout: 3000, retry: 2 });
 */
@Injectable()
export class GrpcCaller {
  private breaker: CircuitBreaker;

  constructor() {
    this.breaker = new CircuitBreaker(this.execute.bind(this), {
      timeout: 3000,
      errorThresholdPercentage: 50,
      resetTimeout: 10000,
      // 최소 요청 수: 너무 적은 요청에서 서킷이 열리는 것을 방지
      volumeThreshold: 5,
      // 워밍업 기간: 초기 실패가 서킷을 즉시 열지 않도록
      allowWarmUp: true,
      // 통계 윈도우: 10초 동안의 통계를 추적
      rollingCountTimeout: 10000,
      // 통계 버킷: 1초 단위로 10개 버킷
      rollingCountBuckets: 10,
      // 동시 요청 수 제한: 무제한 동시 요청 방지
      capacity: 100,
    });
  }

  private async execute<T>(fn: () => Promise<T>) {
    return fn();
  }

  async call<T>(fn: () => Observable<T>, options?: GrpcCallerOptions): Promise<T> {
    return this.breaker.fire(async () =>
      lastValueFrom(
        fn().pipe(
          timeout(options?.timeout ?? 3000),
          retry(options?.retry ?? 0),
          catchError((err) => {
            throw this.mapError(err);
          }),
        ),
      ),
    ) as Promise<T>;
  }

  private mapError(err: Error) {
    return new InternalServerErrorException(err.message);
  }
}
