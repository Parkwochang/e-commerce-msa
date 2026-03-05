import { RpcException } from '@nestjs/microservices';

import { type GrpcErrorResponse, GRPC_STATUS, type GrpcStatusCode } from '../constants';

export interface AppRpcExceptionOptions {
  code?: GrpcStatusCode;
  message?: string;
  metadata?: any;
}

export class AppRpcException extends RpcException {
  readonly code: GrpcStatusCode;
  readonly metadata?: any;

  constructor(options: AppRpcExceptionOptions) {
    const payload: GrpcErrorResponse = {
      code: options.code ?? GRPC_STATUS.INTERNAL,
      message: options.message ?? 'Internal server error',
      metadata: options.metadata,
    };
    super(payload);

    this.code = payload.code;
    this.metadata = payload.metadata;
  }
}
