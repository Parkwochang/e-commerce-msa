import Redis from 'ioredis';
import { Module, DynamicModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { COMMON_CONFIG, type CommonConfigType } from '@repo/config/env';

import { RedisService } from './redis.service';
import { REDIS_CACHE } from './redis.constants';

// ----------------------------------------------------------------------------

@Module({})
export class RedisModule {
  static forRootAsync(): DynamicModule {
    return {
      module: RedisModule,
      global: true,
      imports: [ConfigModule],
      providers: [
        {
          provide: REDIS_CACHE,
          useFactory: (configService: ConfigService) => {
            const redisConfig = configService.get<CommonConfigType>(COMMON_CONFIG.KEY);

            if (!redisConfig) {
              throw new Error('Redis config is required');
            }

            return new Redis({
              host: redisConfig.REDIS_HOST,
              port: redisConfig.REDIS_PORT,
              connectTimeout: 5000,
            });
          },
          inject: [ConfigService],
        },
        RedisService,
      ],
      exports: [RedisService],
    };
  }
}
