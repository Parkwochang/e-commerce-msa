import { Controller, Get, Logger, Param } from '@nestjs/common';
import { UserGrpcService } from './user-grpc.service';

@Controller('users')
export class UserController {
  private readonly logger = new Logger(UserController.name);

  // ✅ 일반적인 NestJS 의존성 주입 방식 사용
  constructor(private readonly userGrpcService: UserGrpcService) {
    this.logger.log('UserController initialized');
  }

  @Get()
  async findAll() {
    this.logger.log('Fetching all users from User microservice');
    return this.userGrpcService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    this.logger.log(`Fetching user ${id} from User microservice`);
    return this.userGrpcService.findOne(id);
  }
}
