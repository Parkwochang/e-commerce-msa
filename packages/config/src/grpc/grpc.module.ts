import { Module } from '@nestjs/common';
import { ClientsModule } from '@nestjs/microservices';
import { join } from 'path';
import { createGrpcClient } from './grpc-client.factory';

@Module({})
export class GrpcModule {
  static forRoot(options: { url: string; protoPath: string; packageName: string }) {
    return {
      module: GrpcModule,
      imports: [ClientsModule.register([createGrpcClient(options)])],
    };
  }
}

@Module({
  imports: [
    ClientsModule.register([
      createGrpcClient({
        name: 'USER_SERVICE',
        url: process.env.USER_SVC_GRPC_URL || 'localhost:50051',
        protoPath: join(__dirname, '../protos/user.proto'),
        packageName: 'user',
      }),
    ]),
  ],
  exports: [ClientsModule],
})
export class UserGrpcModule {}
