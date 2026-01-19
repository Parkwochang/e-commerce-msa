import { Controller, Get, Post, Body, Logger, Param } from '@nestjs/common';
import { OrderGrpcService } from './order-grpc.service';

@Controller('orders')
export class OrderController {
  private readonly logger = new Logger(OrderController.name);

  constructor(private readonly orderGrpcService: OrderGrpcService) {
    this.logger.log('OrderController initialized');
  }

  @Post()
  async create(
    @Body()
    createOrderDto: {
      userId: string;
      productId: string;
      quantity: number;
    },
  ) {
    this.logger.log('Creating order via Order microservice');
    return this.orderGrpcService.create(createOrderDto);
  }

  // ⚠️ 구체적인 라우트를 먼저 정의 (중요!)
  // GET /orders/user/:userId
  @Get('user/:userId')
  async findByUser(@Param('userId') userId: string) {
    this.logger.log(
      `Fetching orders for user ${userId} from Order microservice`,
    );
    return this.orderGrpcService.findByUser(userId);
  }

  // 동적 파라미터는 나중에 (catch-all 역할)
  // GET /orders/:id
  @Get(':id')
  async findOne(@Param('id') id: string) {
    this.logger.log(`Fetching order ${id} from Order microservice`);
    return this.orderGrpcService.findOne(id);
  }
}
