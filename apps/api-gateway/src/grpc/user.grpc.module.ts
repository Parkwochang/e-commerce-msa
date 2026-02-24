import { Module } from '@nestjs/common';

import {
  createGrpcClientConfig,
  GRPC_PACKAGE,
  GRPC_SERVICE,
  GrpcCaller,
  GrpcModule,
} from '@repo/config/grpc';
import { PROTO_PATHS } from '@repo/proto';

import { UserGrpcService } from './user.grpc.service';

// ----------------------------------------------------------------------------

@Module({
  imports: [
    GrpcModule.registerAsync([
      createGrpcClientConfig(GRPC_SERVICE.USER, (config) => ({
        url: config.USER_GRPC_URL,
        package: GRPC_PACKAGE.USER,
        protoPath: PROTO_PATHS.USER,
      })),
    ]),
  ],
  providers: [UserGrpcService, GrpcCaller],
  exports: [UserGrpcService],
})
export class UserGrpcModule {}
