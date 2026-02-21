import { Transport } from '@nestjs/microservices';
import type { ClientOptions, ClientProviderOptions, GrpcOptions } from '@nestjs/microservices';

// ----------------------------------------------------------------------------

export interface GrpcClientOptions {
  name: string;
  url: string;
  protoPath: string;
  package: string;
}

export function createGrpcClient(config: GrpcClientOptions): ClientProviderOptions {
  const { name, ...rest } = config;

  return {
    name,
    transport: Transport.GRPC,
    options: {
      ...rest,
      loader: {
        keepCase: true,
        longs: String,
        enums: String,
        defaults: true,
        oneofs: true,
      },
    },
  };
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
// ! 서비스에서 grpc 연결

export function connectGrpcClient(config: Omit<GrpcClientOptions, 'name'>): GrpcOptions {
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
    },
  };
}
