import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { type ClientGrpc } from '@nestjs/microservices';
import { Metadata } from '@grpc/grpc-js';

import { User } from '@repo/proto';
import { GRPC_SERVICE, GrpcCaller } from '@repo/config/grpc';
import { getTraceId } from '@repo/logger';

// ----------------------------------------------------------------------------

/**
 * User 마이크로서비스와 통신하는 gRPC 클라이언트 래퍼 서비스
 * @description 외부 gRPC 호출에 서킷 브레이커를 적용하여 보호합니다.
 */
@Injectable()
export class UserGrpcService implements OnModuleInit {
  private userService!: User.UserServiceClient;
  private readonly logger = new Logger(UserGrpcService.name);

  constructor(
    @Inject(GRPC_SERVICE.USER) private readonly client: ClientGrpc,
    private readonly grpcCaller: GrpcCaller,
  ) {}

  onModuleInit() {
    this.userService =
      this.client.getService<User.UserServiceClient>('UserService');
  }

  /**
   * 모든 사용자 조회
   */
  async findAll(request: User.FindAllRequest): Promise<User.UserListResponse> {
    this.logger.log('findAll() called', request);

    // TODO : helper 함수 필요
    const metadata = new Metadata();
    metadata.set('x-trace-id', getTraceId() ?? '');

    return this.grpcCaller.call(() =>
      this.userService.findAll(request, metadata),
    );
  }

  /**
   * 사용자 ID로 조회
   */
  async findOne(id: string): Promise<User.UserResponse> {
    return this.grpcCaller.call(() =>
      this.userService.findOne({ id }, new Metadata()),
    );
  }

  /**
   * 사용자 생성
   */
  async create(data: User.CreateUserRequest): Promise<User.UserResponse> {
    return this.grpcCaller.call(() =>
      this.userService.create(data, new Metadata()),
    );
  }
}
