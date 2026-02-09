import { Module } from '@nestjs/common';

import { PrismaService, RedisService } from './service';

@Module({
  providers: [PrismaService, RedisService],
  exports: [PrismaService, RedisService],
})
export class DatabaseModule {}
