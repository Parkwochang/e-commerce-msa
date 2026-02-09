import { APP_CONFIG, REDIS_CONFIG } from '@/config';
import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import * as Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private client!: Redis.Redis;
  // private cluster!: Redis.Cluster;

  onModuleInit() {
    const host = REDIS_CONFIG().host;
    const port = REDIS_CONFIG().port;
    const password = REDIS_CONFIG().password;

    console.log(host, port, password);

    this.client = new Redis.Redis({
      host,
      port,
      // password,
      connectTimeout: 5000,
    });

    // if (APP_CONFIG().NODE_ENV === 'production') {
    //   this.client = new Redis.Cluster(
    //     Array.from({ length: 6 }, (_, i) => ({
    //       host: `redis-cluster-${i}.redis-cluster.redis.svc.cluster.local`,
    //       port: 6379,
    //     })),
    //     // {
    //     //   clusterRetryStrategy: (times) => {
    //     //     return Math.min(times * 50, 2000);
    //     //   },
    //     // }
    //   );
    // } else {
    //   this.client = new Redis.Redis({
    //     host,
    //     port,
    //     password,
    //     connectTimeout: 5000,
    //   });
    // }

    this.client.on('connect', () => {
      this.logger.log('Redis connected');
    });

    this.client.on('error', (err) => {
      this.logger.error('Redis error', err);
    });
  }

  onModuleDestroy() {
    this.client?.quit();
  }

  getClient(): Redis.Cluster | Redis.Redis {
    return this.client;
  }

  async set(key: string, value: string, ttlSeconds?: number) {
    if (ttlSeconds) {
      return await this.client.set(key, value, 'EX', ttlSeconds);
    }

    return await this.client.set(key, value);
  }

  async get(key: string): Promise<string | null> {
    return this.client.get(key);
  }

  async del(key: string): Promise<number> {
    return this.client.del(key);
  }
}
