import { Module, DynamicModule } from '@nestjs/common';
import { ClientsModule } from '@nestjs/microservices';
import { createGrpcClient, GrpcClientOptions } from './grpc-client.factory';

@Module({})
export class GrpcModule {
  /**
   * 단일 또는 여러 gRPC 클라이언트를 등록합니다.
   *
   * @example
   * // 단일 클라이언트
   * GrpcModule.forRoot({
   *   name: 'USER_SERVICE',
   *   url: 'localhost:5001',
   *   protoPath: 'proto/user.proto',
   *   packageName: 'user',
   * })
   *
   * @example
   * // 여러 클라이언트
   * GrpcModule.forRoot([
   *   {
   *     name: 'USER_SERVICE',
   *     url: 'localhost:5001',
   *     protoPath: 'proto/user.proto',
   *     packageName: 'user',
   *   },
   *   {
   *     name: 'ORDER_SERVICE',
   *     url: 'localhost:5002',
   *     protoPath: 'proto/order.proto',
   *     packageName: 'order',
   *   },
   * ])
   */
  static forRoot(options: GrpcClientOptions | GrpcClientOptions[]): DynamicModule {
    const clients = Array.isArray(options) ? options : [options];

    return {
      module: GrpcModule,
      imports: [ClientsModule.register(clients.map((client) => createGrpcClient(client)))],
      exports: [ClientsModule],
    };
  }
}
