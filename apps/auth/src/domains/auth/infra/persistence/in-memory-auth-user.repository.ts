import { Injectable } from '@nestjs/common';

import type { AuthUserRepositoryPort } from '@/domains/auth/application/ports';
import { AuthUserEntity } from '@/domains/auth/domain';

const SAMPLE_USERS = [
  new AuthUserEntity(
    'auth-user-1',
    'admin@example.com',
    'Admin',
    'password123',
    'LOCAL',
    'ADMIN',
    'ACTIVE',
  ),
  new AuthUserEntity(
    'auth-user-2',
    'locked@example.com',
    'Locked User',
    'password123',
    'LOCAL',
    'CUSTOMER',
    'LOCKED',
  ),
];

@Injectable()
export class InMemoryAuthUserRepository implements AuthUserRepositoryPort {
  async findByEmail(email: string): Promise<AuthUserEntity | null> {
    return SAMPLE_USERS.find((user) => user.email === email) ?? null;
  }
}
