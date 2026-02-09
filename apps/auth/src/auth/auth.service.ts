import { Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { User } from '@repo/proto-types';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    // private readonly userRepository: AuthUserRepository,
    private readonly jwtService: JwtService,
  ) {}

  async login(email: string, password: string) {
    this.logger.log('user login', { email, password });

    await this.validateUser(email, password);

    return this.jwtService.sign({ email });
  }

  async findUserByEmail(email: string): Promise<User.UserResponse> {
    this.logger.log(`Finding user: ${email}`);

    return {
      id: 'admin',
      email: 'admin@example.com',
      name: 'Admin',
      createdAt: new Date().toISOString(),
    };
  }

  async validateUser(email: string, password: string) {

    return true;
    // return this.userRepository.validateUser(email, password);
  }

  validateToken(accessToken: string) {
    return this.jwtService.verify(accessToken);
  }

  decodeToken(accessToken: string) {
    return this.jwtService.decode(accessToken);
  }
}
