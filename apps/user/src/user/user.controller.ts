import { Controller, Logger } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { UserService } from './user.service';
import { Metadata, ServerUnaryCall } from '@grpc/grpc-js';

/**
 * User gRPC Controller
 *
 * @description
 * API Gateway로부터 gRPC 요청을 받아 처리하는 컨트롤러
 */
@Controller()
export class UserController {
  private readonly logger = new Logger(UserController.name);

  constructor(private readonly userService: UserService) {}

  @GrpcMethod('UserService', 'FindOne')
  async findOne(
    data: { id: string },
    metadata: Metadata,
    call: ServerUnaryCall<any, any>,
  ) {
    this.logger.log(`Finding user with id: ${data.id}`, { metadata, call });
    return this.userService.findOne(data.id);
  }

  @GrpcMethod('UserService', 'FindAll')
  async findAll(data: {}) {
    this.logger.log('Finding all users');
    return this.userService.findAll();
  }

  @GrpcMethod('UserService', 'Create')
  async create(data: { email: string; name: string; password: string }) {
    this.logger.log(`Creating user: ${data.email}`);
    return this.userService.create(data);
  }
}
