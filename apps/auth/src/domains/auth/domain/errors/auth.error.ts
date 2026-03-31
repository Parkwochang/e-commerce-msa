import { AppRpcException } from '@repo/errors';
import { GRPC_STATUS } from '@repo/core';

export class InvalidCredentialsError extends AppRpcException {
  constructor(message?: string) {
    super({
      code: GRPC_STATUS.INVALID_ARGUMENT,
      message: message ?? 'Invalid email or password',
    });
  }
}

export class PasswordLoginNotAvailableError extends AppRpcException {
  constructor() {
    super({
      code: GRPC_STATUS.UNAUTHENTICATED,
      message: 'Password login is not available for this account',
    });
  }
}

export class InactiveAuthUserError extends AppRpcException {
  constructor() {
    super({
      code: GRPC_STATUS.UNAUTHENTICATED,
      message: 'This account is not active',
    });
  }
}
