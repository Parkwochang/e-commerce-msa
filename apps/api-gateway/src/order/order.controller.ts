import { Controller, Get, Post, Body, Inject, Logger, Param } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { Observable } from 'rxjs';

// gRPC 서비스 인터페이스
interface OrderService {
  create(data: { userId: string; productId: string; quantity: number }): Observable<any>;
  findOne(data: { id: string }): Observable<any>;
  findByUser(data: { userId: string }): Observable<any>;
}

@Controller('orders')
export class OrderController {
  private readonly logger = new Logger(OrderController.name);
  private orderService: OrderService;

  constructor(
    @Inject('ORDER_SERVICE') private readonly client: ClientGrpc,
  ) {}

  onModuleInit() {
    this.orderService = this.client.getService<OrderService>('OrderService');
    this.logger.log('OrderService gRPC client initialized');
  }

  @Post()
  async create(@Body() createOrderDto: { userId: string; productId: string; quantity: number }) {
    this.logger.log('Creating order via Order microservice');
    return this.orderService.create(createOrderDto);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    this.logger.log(`Fetching order ${id} from Order microservice`);
    return this.orderService.findOne({ id });
  }

  @Get('user/:userId')
  async findByUser(@Param('userId') userId: string) {
    this.logger.log(`Fetching orders for user ${userId} from Order microservice`);
    return this.orderService.findByUser({ userId });
  }
}

