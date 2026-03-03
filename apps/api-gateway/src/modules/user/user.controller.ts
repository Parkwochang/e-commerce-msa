import { Controller, Get, Param } from '@nestjs/common';

import { AppLogger } from '@repo/logger';

import { UserFacade } from './user.facade';

@Controller('users')
export class UserController {
  constructor(
    private readonly facade: UserFacade,
    private readonly appLogger: AppLogger,
  ) {
    this.appLogger.setContext(UserController.name);
    this.appLogger.info('UserController initialized');
  }

  @Get()
  async findAll() {
    this.appLogger.info('Fetching all users from User microservice');
    return this.facade.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    this.appLogger.info(`Fetching user ${id} from User microservice`, {
      userId: id,
    });
    return this.facade.findOne(id);
  }
}
