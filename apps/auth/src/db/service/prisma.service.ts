import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { type ConfigService } from '@nestjs/config';
import { Prisma, PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient<Prisma.PrismaClientOptions, 'query' | 'error'>
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);

  constructor(private readonly configService: ConfigService) {
    super({
      log: [
        {
          emit: 'event',
          level: 'query',
        },
        {
          emit: 'event',
          level: 'error',
        },
        {
          emit: 'stdout',
          level: 'info',
        },
        {
          emit: 'stdout',
          level: 'warn',
        },
      ],
    });
  }

  async onModuleInit() {
    if (this.configService.get('NODE_ENV') === 'development') {
      this.$on('query', (event) => {
        this.logger.verbose(event.query, event.duration);
      });
    }

    this.$on('error', (event) => {
      this.logger.verbose(event.target);
    });

    await this.$connect().then(() => {
      this.logger.log('Prisma connected');
    });
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}

// this.$use(async (params, next) => {
//   // DB 입력: camelCase → snake_case
//   if (params.args?.data) {
//     params.args.data = this.caseTransform.toSnakeCase(params.args.data);
//   }
//   if (params.args?.where) {
//     params.args.where = this.caseTransform.toSnakeCase(params.args.where);
//   }

//   const result = await next(params);

//   // DB 출력: snake_case → camelCase
//   return this.caseTransform.toCamelCase(result);
// });
