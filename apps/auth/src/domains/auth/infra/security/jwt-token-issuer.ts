import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import type {
  TokenIssuerPayload,
  TokenIssuerPort,
  TokenIssuerResult,
} from '@/domains/auth/application/ports';

@Injectable()
export class JwtTokenIssuer implements TokenIssuerPort {
  constructor(private readonly jwtService: JwtService) {}

  async issue(payload: TokenIssuerPayload): Promise<TokenIssuerResult> {
    const subject = {
      sub: payload.userId,
      email: payload.email,
    };

    return {
      accessToken: await this.jwtService.signAsync(subject, {
        expiresIn: '15m',
      }),
      refreshToken: await this.jwtService.signAsync(subject, {
        expiresIn: '7d',
      }),
    };
  }
}
