import { Controller, Get, Inject, Logger, Param } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { Observable } from 'rxjs';

// gRPC 서비스 인터페이스 (proto 파일과 일치해야 함)
interface UserService {
  findOne(data: { id: string }): Observable<any>;
  findAll(data: {}): Observable<any>;
}

@Controller('users')
export class UserController {
  private readonly logger = new Logger(UserController.name);
  private userService: UserService;

  constructor(@Inject('USER_SERVICE') private readonly client: ClientGrpc) {}

  onModuleInit() {
    // gRPC 서비스 초기화
    this.userService = this.client.getService<UserService>('UserService');
    this.logger.log('UserService gRPC client initialized');
  }

  @Get()
  async findAll() {
    this.logger.log('Fetching all users from User microservice');
    return this.userService.findAll({});
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    this.logger.log(`Fetching user ${id} from User microservice`);
    return this.userService.findOne({ id });
  }
}
