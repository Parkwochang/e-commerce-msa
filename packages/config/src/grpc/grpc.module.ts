import { Module } from '@nestjs/common';
import { ClientsModule } from '@nestjs/microservices';
import { join } from 'path';
import { createGrpcClient } from './grpc-client.factory';

@Module({})
export class GrpcModule {
  static forRoot(options: { url: string; protoPath: string; packageName: string; name: string }) {
    return {
      module: GrpcModule,
      imports: [ClientsModule.register([createGrpcClient(options)])],
    };
  }
}
