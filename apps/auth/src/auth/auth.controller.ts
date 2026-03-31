import { Controller, Logger } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { AuthService } from './auth.service';
import { Metadata, ServerUnaryCall } from '@grpc/grpc-js';
import { User } from '@repo/proto';

@Controller()
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(private readonly authService: AuthService) {}

  @GrpcMethod('AuthService', 'FindUserByEmail')
  async findUser(data: User.FindOneRequest): Promise<User.UserResponse> {
    const email = data.email ?? data.id;

    if (!email) {
      throw new Error('email or id is required');
    }

    this.logger.log(`Finding user: ${email}`);
    return this.authService.findUserByEmail(email);
  }
}
