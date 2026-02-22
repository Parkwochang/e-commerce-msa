import { Injectable, Inject, OnModuleInit } from '@nestjs/common';
import { type ClientGrpc } from '@nestjs/microservices';
import { Metadata } from '@grpc/grpc-js';
import { Observable } from 'rxjs';

import { User } from '@repo/proto';
import { GRPC_SERVICE } from '@repo/config/grpc';

/**
 * User 마이크로서비스와 통신하는 gRPC 클라이언트 래퍼 서비스
 */
@Injectable()
export class UserGrpcService implements OnModuleInit {
  private userService!: User.UserServiceClient; // onModuleInit에서 초기화됨

  constructor(@Inject(GRPC_SERVICE.USER) private readonly client: ClientGrpc) {}

  onModuleInit() {
    this.userService =
      this.client.getService<User.UserServiceClient>('UserService');
  }

  /**
   * 모든 사용자 조회
   */
  findAll(request: User.FindAllRequest): Observable<User.UserListResponse> {
    return this.userService.findAll(request, new Metadata());
  }

  /**
   * 사용자 ID로 조회
   */
  findOne(id: string): Observable<User.UserResponse> {
    const request: User.FindOneRequest = { id };
    return this.userService.findOne({ id }, new Metadata());
  }
}
