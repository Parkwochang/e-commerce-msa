import { Injectable, Inject, OnModuleInit } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { Observable } from 'rxjs';
import { Metadata } from '@grpc/grpc-js';

import { User } from '@repo/proto-types';

/**
 * User 마이크로서비스와 통신하는 gRPC 클라이언트 래퍼 서비스
 */
@Injectable()
export class UserGrpcService implements OnModuleInit {
  private userService!: User.UserServiceClient; // onModuleInit에서 초기화됨

  constructor(@Inject('USER_SERVICE') private readonly client: ClientGrpc) {}

  onModuleInit() {
    this.userService =
      this.client.getService<User.UserServiceClient>('UserService');
  }

  /**
   * 모든 사용자 조회
   */
  findAll(): Observable<User.UserListResponse> {
    const request: User.FindAllRequest = {};
    return this.userService.findAll(request, new Metadata());
  }

  /**
   * 사용자 ID로 조회
   */
  findOne(id: string): Observable<User.UserResponse> {
    const request: User.FindOneRequest = { id };
    return this.userService.findOne(request, new Metadata());
  }
}
