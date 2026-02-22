import { Transport } from '@nestjs/microservices';
import type { ClientOptions, GrpcOptions } from '@nestjs/microservices';

// ----------------------------------------------------------------------------

export interface GrpcClientOptions {
  name: string;
  url: string;
  protoPath: string;
  package: string;
}

// ----------------------------------------------------------------------------
// ! 각 서비스 grpc 연결

export const createGrpcOptions = (config: Omit<GrpcClientOptions, 'name'>): ClientOptions => {
  return {
    transport: Transport.GRPC,
    options: {
      ...config,
      loader: {
        keepCase: true,
        longs: String,
        enums: String,
        defaults: true,
        oneofs: true,
      },
      channelOptions: {
        'grpc.keepalive_time_ms': 10000,
        'grpc.keepalive_timeout_ms': 5000,
        'grpc.keepalive_permit_without_calls': 1,
      },
    },
  };
};

// ----------------------------------------------------------------------------
// ! 서비스 서버 grpc 등록용

export function connectGrpcServer(config: { url: string; protoPath: string; package: string }): GrpcOptions {
  return {
    transport: Transport.GRPC,
    options: {
      url: config.url,
      protoPath: config.protoPath,
      package: config.package,
      loader: {
        keepCase: true,
        longs: String,
        enums: String,
        defaults: true,
        oneofs: true,
      },
      channelOptions: {
        'grpc.keepalive_time_ms': 10000,
        'grpc.keepalive_timeout_ms': 5000,
        'grpc.keepalive_permit_without_calls': 1,
      },
    },
  };
}
