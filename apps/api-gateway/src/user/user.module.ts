import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserGrpcService } from './user-grpc.service';

@Module({
  controllers: [UserController],
  providers: [UserGrpcService],
  exports: [UserGrpcService],
})
export class UserModule {}

