import { Injectable, Inject, OnModuleInit } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { Observable } from 'rxjs';
import { 
  UserServiceClient, 
  FindOneRequest, 
  FindAllRequest,
  UserResponse,
  UserListResponse 
} from '@repo/proto-types';

/**
 * User 마이크로서비스와 통신하는 gRPC 클라이언트 래퍼 서비스
 */
@Injectable()
export class UserGrpcService implements OnModuleInit {
  private userService!: UserServiceClient; // onModuleInit에서 초기화됨

  constructor(@Inject('USER_SERVICE') private readonly client: ClientGrpc) {}

  onModuleInit() {
    this.userService = this.client.getService<UserServiceClient>('UserService');
  }

  /**
   * 모든 사용자 조회
   */
  findAll(): Observable<UserListResponse> {
    const request: FindAllRequest = {};
    return this.userService.findAll(request);
  }

  /**
   * 사용자 ID로 조회
   */
  findOne(id: string): Observable<UserResponse> {
    const request: FindOneRequest = { id };
    return this.userService.findOne(request);
  }
}

