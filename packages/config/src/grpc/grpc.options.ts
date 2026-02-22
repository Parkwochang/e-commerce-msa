import { ConfigService, ConfigType } from '@nestjs/config';
import { Transport } from '@nestjs/microservices';
import type { ClientOptions, GrpcOptions } from '@nestjs/microservices';

import { GATEWAY_CONFIG, type GatewayConfigType } from '../env';

// ----------------------------------------------------------------------------

export interface GrpcClientOptions extends GrpcClientConfig {
  name: string;
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

export function connectGrpcServer(config: GrpcClientConfig): GrpcOptions {
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

// ----------------------------------------------------------------------------
// ! 서비스 grpc 클라이언트 등록용 -> useFactory config 사용 간소화

export const createGrpcClientConfig = (
  name: string,
  getConfig: (config: GatewayConfigType) => Promise<GrpcClientConfig> | GrpcClientConfig,
  inject?: any[],
) => ({
  name,
  useFactory: async (configService: ConfigService) => {
    const gatewayConfig = configService.get<GatewayConfigType>(GATEWAY_CONFIG.KEY);

    if (!gatewayConfig) {
      throw new Error('Gateway config is required');
    }

    return await getConfig(gatewayConfig);
  },
  inject: inject || [ConfigService],
  imports: [],
});
