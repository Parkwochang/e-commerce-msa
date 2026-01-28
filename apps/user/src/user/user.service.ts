import { Injectable, Logger } from '@nestjs/common';
import { User } from '@repo/proto-types';

/**
 * User Service
 *
 * @description
 * 사용자 관련 비즈니스 로직을 처리합니다.
 * 실제로는 데이터베이스와 연동됩니다.
 */
@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  // Mock 데이터 (실제로는 DB에서 조회)
  private users = [
    {
      id: '1',
      email: 'user1@example.com',
      name: 'User One',
      created_at: new Date().toISOString(),
    },
    {
      id: '2',
      email: 'user2@example.com',
      name: 'User Two',
      created_at: new Date().toISOString(),
    },
  ];

  async findOne(id: string): Promise<User.UserResponse> {
    this.logger.log(`Finding user: ${id}`);
    const user = this.users.find((u) => u.id === id);

    if (!user) {
      throw new Error(`User with id ${id} not found`);
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      createdAt: user.created_at,
    };
  }

  async findAll(): Promise<User.UserListResponse> {
    this.logger.log('Finding all users');
    return {
      users: this.users.map((u) => ({
        id: u.id,
        email: u.email,
        name: u.name,
        createdAt: u.created_at,
      })),
    };
  }

  async create(data: User.CreateUserRequest): Promise<User.UserResponse> {
    this.logger.log(`Creating user: ${data.email}`);

    const newUser = {
      id: String(this.users.length + 1),
      email: data.email,
      name: data.name,
      created_at: new Date().toISOString(),
    };

    this.users.push(newUser);

    return {
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
      createdAt: newUser.created_at,
    };
  }
}
