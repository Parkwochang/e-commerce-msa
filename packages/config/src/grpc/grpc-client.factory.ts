import { Transport } from '@nestjs/microservices';
import type { ClientProviderOptions, GrpcOptions } from '@nestjs/microservices';

export interface GrpcClientOptions {
  name: string;
  url: string;
  protoPath: string;
  packageName: string;
}

export function createGrpcClient(config: GrpcClientOptions): ClientProviderOptions {
  return {
    name: config.name,
    transport: Transport.GRPC,
    options: {
      url: config.url,
      package: config.packageName,
      protoPath: config.protoPath,
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

export function connectGrpcClient(config: GrpcClientOptions): GrpcOptions {
  return {
    transport: Transport.GRPC,
    options: {
      package: config.packageName,
      protoPath: config.protoPath,
      url: config.url,
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
