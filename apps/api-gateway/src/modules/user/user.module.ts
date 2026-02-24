import { Module } from '@nestjs/common';

import { UserGrpcModule } from '@/grpc/user.grpc.module';
import { UserController } from './user.controller';
import { UserFacade } from './user.facade';

// ----------------------------------------------------------------------------

@Module({
  imports: [UserGrpcModule],
  controllers: [UserController],
  providers: [UserFacade],
})
export class UserModule {}
