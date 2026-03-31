import {
  InactiveAuthUserError,
  InvalidCredentialsError,
  PasswordLoginNotAvailableError,
} from '@/domains/auth/domain/errors/auth.error';

export class AuthUserEntity {
  constructor(
    public readonly id: string,
    public readonly email: string,
    public readonly name: string,
    public readonly password: string | null,
    public readonly provider:
      | 'LOCAL'
      | 'GOOGLE'
      | 'APPLE'
      | 'KAKAO'
      | 'NAVER' = 'LOCAL',
    public readonly role: 'CUSTOMER' | 'ADMIN' | 'OPERATOR' = 'CUSTOMER',
    public readonly status:
      | 'ACTIVE'
      | 'DORMANT'
      | 'SUSPENDED'
      | 'WITHDRAWN' = 'ACTIVE',
    public readonly createdAt: Date = new Date(),
    public readonly updatedAt: Date = new Date(),
    public readonly lastLoginAt: Date | null = null,
  ) {}

  isOauthAccount(): boolean {
    return this.provider !== 'LOCAL';
  }

  hasPassword(): boolean {
    return typeof this.password === 'string' && this.password.length > 0;
  }

  isPasswordMatched(password: string): boolean {
    return this.password === password;
  }

  isActive(): boolean {
    return this.status === 'ACTIVE';
  }

  canLoginWithPassword(input: { password: string }): boolean {
    return (
      !this.isOauthAccount() &&
      this.hasPassword() &&
      this.isPasswordMatched(input.password) &&
      this.isActive()
    );
  }

  assertCanLoginWithPassword(input: { password: string }): void {
    if (this.isOauthAccount() || !this.hasPassword()) {
      throw new PasswordLoginNotAvailableError();
    }

    if (!this.isActive()) {
      throw new InactiveAuthUserError();
    }

    if (!this.isPasswordMatched(input.password)) {
      throw new InvalidCredentialsError();
    }
  }
}
