import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { type ConfigService } from '@nestjs/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

import { type AppConfigType } from '@repo/config/env';

import { PrismaClient, Prisma } from '@/generated/prisma/client';

// ----------------------------------------------------------------------------

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);
  private pool: Pool;

  constructor(private readonly configService: ConfigService) {
    const databaseConfig = configService.get<AppConfigType>('app');

    const pool = new Pool({
      connectionString: databaseConfig?.DATABASE_URL,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });

    const adapter = new PrismaPg(pool);

    const clientOptions: Prisma.PrismaClientOptions = {
      adapter,
      log: [
        {
          emit: 'event',
          level: 'query',
        },
        {
          emit: 'event',
          level: 'error',
        },
      ],
    };

    super(clientOptions);

    // 클래스 상속 초기화 순서 보장을 위해 super 호출 후 pool 할당 (부모 클래스 prisma client 초기화 후 실행)
    this.pool = pool;
  }

  async onModuleInit() {
    if (this.configService.get('NODE_ENV') === 'development') {
      (this as PrismaClient<Prisma.LogLevel>).$on(
        'query',
        (event: Prisma.QueryEvent) => {
          this.logger.verbose(event.query, event.duration);
        },
      );
    }

    (this as PrismaClient<Prisma.LogLevel>).$on(
      'error',
      (event: Prisma.LogEvent) => {
        this.logger.verbose(event.target);
      },
    );

    await this.$connect().then(() => {
      this.logger.log('Prisma connected');
    });
  }

  async onModuleDestroy() {
    await this.$disconnect();
    await this.pool.end();
  }
}
