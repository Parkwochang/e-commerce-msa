import { Injectable, Inject, OnModuleInit } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { Observable } from 'rxjs';

// gRPC 서비스 인터페이스
interface UserService {
  findOne(data: { id: string }): Observable<any>;
  findAll(data: {}): Observable<any>;
}

/**
 * User 마이크로서비스와 통신하는 gRPC 클라이언트 래퍼 서비스
 */
@Injectable()
export class UserGrpcService implements OnModuleInit {
  private userService!: UserService; // onModuleInit에서 초기화됨

  constructor(@Inject('USER_SERVICE') private readonly client: ClientGrpc) {}

  onModuleInit() {
    this.userService = this.client.getService<UserService>('UserService');
  }

  /**
   * 모든 사용자 조회
   */
  findAll(): Observable<any> {
    return this.userService.findAll({});
  }

  /**
   * 사용자 ID로 조회
   */
  findOne(id: string): Observable<any> {
    return this.userService.findOne({ id });
  }
}

