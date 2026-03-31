import type { AuthUserEntity } from '@/domains/auth/domain/entities/auth-user.entity';

export const AUTH_USER_REPOSITORY = Symbol('AUTH_USER_REPOSITORY');

export interface AuthUserRepositoryPort {
  findByEmail(email: string): Promise<AuthUserEntity | null>;
}
