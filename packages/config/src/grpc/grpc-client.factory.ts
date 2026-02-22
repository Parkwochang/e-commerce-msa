import { type FactoryProvider } from '@nestjs/common';
import { type ClientGrpcProxy, ClientProxyFactory } from '@nestjs/microservices';

import { createGrpcOptions } from './grpc.options';

// ----------------------------------------------------------------------------

/**
 * gRPC 클라이언트 팩토리 함수
 * @description 비동기적으로 gRPC 클라이언트를 등록합니다.
 * @param config - 클라이언트 설정
 * @returns 클라이언트 프로바이더
 * @example
 * createGrpcClientProvider({
 *   name: 'USER_SERVICE',
 *   useFactory: (configService: ConfigService) => {
 *     return {
 *       url: configService.get('USER_SERVICE_URL'),
 *       package: 'user',
 *       protoPath: 'user.proto',
 *     };
 *   },
 *   inject: [ConfigService],
 * });
 */
export const createGrpcClientProvider = (config: GrpcClientAsyncConfig): FactoryProvider<ClientGrpcProxy> => ({
  provide: config.name,
  useFactory: async (...args: any[]) => {
    const options = await config.useFactory(...args);
    return ClientProxyFactory.create(createGrpcOptions(options)) as unknown as ClientGrpcProxy;
  },
  inject: config.inject || [],
});
