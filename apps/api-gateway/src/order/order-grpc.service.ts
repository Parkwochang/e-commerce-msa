import { Injectable, Inject, OnModuleInit } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { Observable } from 'rxjs';

// gRPC 서비스 인터페이스
interface OrderService {
  create(data: {
    userId: string;
    productId: string;
    quantity: number;
  }): Observable<any>;
  findOne(data: { id: string }): Observable<any>;
  findByUser(data: { userId: string }): Observable<any>;
}

/**
 * Order 마이크로서비스와 통신하는 gRPC 클라이언트 래퍼 서비스
 *
 * 장점:
 * - 타입 안전성 향상
 * - 일반적인 NestJS 의존성 주입 패턴 사용
 * - gRPC 호출 로직을 한 곳에서 관리
 * - 컨트롤러에서 gRPC 상세 구현 숨김
 */
@Injectable()
export class OrderGrpcService implements OnModuleInit {
  private orderService!: OrderService; // onModuleInit에서 초기화됨

  constructor(@Inject('ORDER_SERVICE') private readonly client: ClientGrpc) {}

  onModuleInit() {
    this.orderService = this.client.getService<OrderService>('OrderService');
  }

  /**
   * 주문 생성
   */
  create(data: {
    userId: string;
    productId: string;
    quantity: number;
  }): Observable<any> {
    return this.orderService.create(data);
  }

  /**
   * 주문 ID로 조회
   */
  findOne(id: string): Observable<any> {
    return this.orderService.findOne({ id });
  }

  /**
   * 사용자 ID로 주문 목록 조회
   */
  findByUser(userId: string): Observable<any> {
    return this.orderService.findByUser({ userId });
  }
}
