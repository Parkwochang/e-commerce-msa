import { Module, DynamicModule, Global } from '@nestjs/common';
import { WinstonModule } from 'nest-winston';
import { getWinstonConfig, WinstonConfigOptions } from './winston.config';

@Global()
@Module({})
export class LoggerModule {
  static forRoot(options?: WinstonConfigOptions): DynamicModule {
    return {
      module: LoggerModule,
      imports: [WinstonModule.forRoot(getWinstonConfig(options))],
      exports: [WinstonModule],
    };
  }
}
