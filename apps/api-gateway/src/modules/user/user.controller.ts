import { Controller, Get, Logger, Param } from '@nestjs/common';
import { UserFacade } from './user.facade';

@Controller('users')
export class UserController {
  private readonly logger = new Logger(UserController.name);

  constructor(private facade: UserFacade) {
    this.logger.log('UserController initialized');
  }

  @Get()
  async findAll() {
    this.logger.log('Fetching all users from User microservice');
    return this.facade.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    this.logger.log(`Fetching user ${id} from User microservice`);
    return this.facade.findOne(id);
  }
}
