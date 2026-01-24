import { Injectable, Logger } from '@nestjs/common';

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

  async findOne(id: string) {
    this.logger.log(`Finding user: ${id}`);
    const user = this.users.find((u) => u.id === id);

    if (!user) {
      throw new Error(`User with id ${id} not found`);
    }

    return user;
  }

  async findAll() {
    this.logger.log('Finding all users');
    return { users: this.users };
  }

  async create(data: { email: string; name: string; password: string }) {
    this.logger.log(`Creating user: ${data.email}`);

    const newUser = {
      id: String(this.users.length + 1),
      email: data.email,
      name: data.name,
      created_at: new Date().toISOString(),
    };

    this.users.push(newUser);

    return newUser;
  }
}
