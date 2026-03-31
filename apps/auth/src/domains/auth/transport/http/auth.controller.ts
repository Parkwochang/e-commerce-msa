import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';

import { LoginCommand } from '@/domains/auth/application/commands';
import { GetAuthUserQuery } from '@/domains/auth/application/queries';
import type { AuthUserDto, LoginResultDto } from '@/domains/auth/application/dto';
import { GetAuthUserParamDto, LoginRequestDto } from './dto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post('login')
  login(@Body() body: LoginRequestDto): Promise<LoginResultDto> {
    return this.commandBus.execute<LoginCommand, LoginResultDto>(
      new LoginCommand(body.email as string, body.password as string),
    );
  }

  @Get('users/:email')
  getAuthUser(@Param() params: GetAuthUserParamDto): Promise<AuthUserDto> {
    return this.queryBus.execute<GetAuthUserQuery, AuthUserDto>(
      new GetAuthUserQuery(params.email as string),
    );
  }
}
