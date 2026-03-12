import { RpcException } from '@nestjs/microservices';

import { ErrorCode, GRPC_STATUS, type GrpcStatusCode } from '@repo/core';

// ----------------------------------------------------------------------------
export interface AppRpcExceptionOptions {
  code?: GrpcStatusCode;
  message?: string | string[];
  errorCode?: ErrorCode;
}

export class AppRpcException extends RpcException {
  constructor(options: AppRpcExceptionOptions) {
    const payload = {
      code: options.code ?? GRPC_STATUS.UNKNOWN,
      message: options.message ?? 'Internal server error',
      errorCode: options.errorCode,
    };
    super(payload);
  }
}
