import type { GrpcStatusCode } from '../constants';

export interface GrpcErrorResponse {
  code: GrpcStatusCode;
  message: string;
  metadata: any;
}
