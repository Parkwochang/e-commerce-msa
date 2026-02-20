import { Module, DynamicModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { RedisConfig } from '@repo/config/config';

import { RedisService } from './redis.service';
import { REDIS_CLIENT } from './redis.constants';

@Module({})
export class RedisModule {
  static forRootAsync(): DynamicModule {
    return {
      module: RedisModule,
      imports: [ConfigModule],
      providers: [
        {
          provide: REDIS_CLIENT,
          useFactory: (configService: ConfigService) => {
            // 타입 안전한 접근
            const redisConfig = configService.get<RedisConfig>('redis');
            return new Redis({
              host: redisConfig?.host || configService.get<string>('REDIS_HOST', 'localhost'),
              port: redisConfig?.port || configService.get<number>('REDIS_PORT', 6379),
              password: redisConfig?.password,
              db: redisConfig?.db,
              connectTimeout: redisConfig?.connectTimeout || 5000,
            });
          },
          inject: [ConfigService],
        },
        RedisService,
      ],
      exports: [REDIS_CLIENT, RedisService],
    };
  }
}
