import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { QueryHandler, type IQueryHandler } from '@nestjs/cqrs';

import { AppLogger } from '@repo/logger';

import type { AuthUserDto } from '@/domains/auth/application/dto/auth-user.dto';
import {
  AUTH_USER_REPOSITORY,
  type AuthUserRepositoryPort,
} from '@/domains/auth/application/ports/user-repository.port';
import { GetAuthUserQuery } from './get-auth-user.query';

@Injectable()
@QueryHandler(GetAuthUserQuery)
export class GetAuthUserHandler implements IQueryHandler<
  GetAuthUserQuery,
  AuthUserDto
> {
  constructor(
    @Inject(AUTH_USER_REPOSITORY)
    private readonly authUserRepository: AuthUserRepositoryPort,
    private readonly logger: AppLogger,
  ) {
    this.logger.setContext(GetAuthUserHandler.name);
  }

  async execute(query: GetAuthUserQuery): Promise<AuthUserDto> {
    this.logger.info(`Loading auth user: ${query.email}`, {
      email: query.email,
    });

    const user = await this.authUserRepository.findByEmail(query.email);

    if (!user) {
      throw new NotFoundException(`Auth user not found: ${query.email}`);
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      status: user.status,
    };
  }
}
