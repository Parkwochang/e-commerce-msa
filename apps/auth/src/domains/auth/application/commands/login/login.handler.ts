import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs';

import { AppLogger } from '@repo/logger';

import { AUTH_USER_REPOSITORY } from '@/domains/auth/application/ports/user-repository.port';
import { TOKEN_ISSUER } from '@/domains/auth/application/ports/token-issuer.port';
import type { LoginResultDto } from '@/domains/auth/application/dto/login-result.dto';
import type { AuthUserRepositoryPort } from '@/domains/auth/application/ports/user-repository.port';
import type { TokenIssuerPort } from '@/domains/auth/application/ports/token-issuer.port';
import { AuthError } from '@/domains/auth/domain/errors/auth.error';
import { LoginCommand } from './login.command';

@Injectable()
@CommandHandler(LoginCommand)
export class LoginHandler implements ICommandHandler<
  LoginCommand,
  LoginResultDto
> {
  constructor(
    @Inject(AUTH_USER_REPOSITORY)
    private readonly authUserRepository: AuthUserRepositoryPort,
    @Inject(TOKEN_ISSUER)
    private readonly tokenIssuer: TokenIssuerPort,
    private readonly logger: AppLogger,
  ) {
    this.logger.setContext(LoginHandler.name);
  }

  async execute(command: LoginCommand): Promise<LoginResultDto> {
    this.logger.info(`Login requested: ${command.email}`, {
      email: command.email,
    });

    const user = await this.authUserRepository.findByEmail(command.email);

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    try {
      user.assertCanLoginWithPassword({ password: command.password });
    } catch (error) {
      if (error instanceof AuthError) {
        throw new UnauthorizedException(error.message);
      }

      throw error;
    }

    const tokens = await this.tokenIssuer.issue({
      userId: user.id,
      email: user.email,
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        status: user.status,
      },
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  }
}
