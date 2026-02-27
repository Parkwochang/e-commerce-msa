import { RpcException } from '@nestjs/microservices';

import { ERROR_CODE, type ErrorCode } from '../constants';
import type { ErrorEnvelope } from '../interfaces';

export interface AppRpcExceptionOptions {
  code?: ErrorCode;
  message: string;
  details?: unknown;
}

export class AppRpcException extends RpcException {
  readonly code: ErrorCode;
  readonly details?: unknown;

  constructor(options: AppRpcExceptionOptions) {
    const payload: ErrorEnvelope = {
      code: options.code ?? ERROR_CODE.INTERNAL_ERROR,
      message: options.message,
      details: options.details,
    };
    super(payload);

    this.code = payload.code;
    this.details = payload.details;
  }
}
