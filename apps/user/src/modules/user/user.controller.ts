import { Controller, Logger } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';

import { User } from '@repo/proto';

import { UserService } from './user.service';

// ----------------------------------------------------------------------------

/**
 * User gRPC Controller
 *
 * @description
 * API Gateway로부터 gRPC 요청을 받아 처리하는 컨트롤러
 */
@Controller()
export class UserController implements User.UserServiceController {
  private readonly logger = new Logger(UserController.name);

  constructor(private readonly userService: UserService) {}

  @GrpcMethod('UserService', 'FindOne')
  async findOne(data: User.FindOneRequest): Promise<User.UserResponse> {
    this.logger.log(`Finding user with id: ${data.id}`);
    return this.userService.findOne(data.id);
  }

  @GrpcMethod('UserService', 'FindAll')
  async findAll(): Promise<User.UserListResponse> {
    this.logger.log('Finding all users');
    return this.userService.findAll();
  }

  @GrpcMethod('UserService', 'Create')
  async create(data: User.CreateUserRequest): Promise<User.UserResponse> {
    this.logger.log(`Creating user: ${data.email}`);
    return this.userService.create(data);
  }
}
