import { Module } from '@nestjs/common';
import { OrderController } from './order.controller';
import { OrderGrpcService } from './order-grpc.service';

@Module({
  controllers: [OrderController],
  providers: [OrderGrpcService],
  exports: [OrderGrpcService], // 다른 모듈에서도 사용할 수 있도록
})
export class OrderModule {}
