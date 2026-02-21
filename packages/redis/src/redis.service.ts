import { Inject, Injectable } from '@nestjs/common';
import type Redis from 'ioredis';

import { REDIS_CACHE } from './redis.constants';

// ----------------------------------------------------------------------------

@Injectable()
export class RedisService {
  constructor(@Inject(REDIS_CACHE) private readonly redis: Redis) {}

  async get(key: string) {
    return this.redis.get(key);
  }

  async set(key: string, value: string, ttl?: number) {
    if (ttl) {
      return this.redis.set(key, value, 'EX', ttl);
    }
    return this.redis.set(key, value);
  }

  async del(key: string) {
    return this.redis.del(key);
  }

  async expire(key: string, ttl: number) {
    return this.redis.expire(key, ttl);
  }

  async ttl(key: string) {
    return this.redis.ttl(key);
  }

  async keys(pattern: string) {
    return this.redis.keys(pattern);
  }
}
