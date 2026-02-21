import { Module, type DynamicModule } from '@nestjs/common';
import { WinstonModule } from 'nest-winston';

import { createWinstonConfig, type WinstonConfigOptions } from './winston.config';

// ----------------------------------------------------------------------------

/**
 * Winston 로거 모듈 등록
 *
 *
 * @param options.serviceName - 서비스 이름
 * @param options.disableFileLog - 파일 로그 비활성화 (production 시 ELK 로그 수집을 위해 비활성화)
 * @param options.level - 로그 레벨
 * @param options.logDir - 로그 디렉토리
 * @param options.maxSize - 파일 최대 크기
 * @param options.maxFiles - 파일 보관 기간
 * @example
 * LoggerModule.forRoot({
 *   serviceName: 'API_GATEWAY',
 *   disableFileLog: process.env.NODE_ENV === 'production',
 */

@Module({})
export class LoggerModule {
  static forRoot(options: WinstonConfigOptions): DynamicModule {
    return {
      global: true,
      module: LoggerModule,
      imports: [WinstonModule.forRoot(createWinstonConfig(options))],
      exports: [WinstonModule],
    };
  }
}
