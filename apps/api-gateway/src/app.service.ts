import { Injectable, LoggerService } from '@nestjs/common';

@Injectable()
export class AppService {
  constructor(private readonly logger: LoggerService) {
    // 서비스 초기화 로그
    this.logger.log('AppService initialized', AppService.name);
  }

  getHello(): string {
    // NestJS LoggerService 사용
    this.logger.log('getHello() called', AppService.name);
    this.logger.log('Processing hello request', AppService.name);

    return 'Hello World!';
  }

  // 에러 처리 예시
  async processData(data: any) {
    try {
      this.logger.log('Processing data...', AppService.name);

      // 비즈니스 로직...
      if (!data) {
        throw new Error('Data is required');
      }

      this.logger.log('Data processed successfully', AppService.name);

      return { success: true, data };
    } catch (error) {
      // 에러 로그 (스택 트레이스 자동 포함)
      // this.logger.error(
      //   `Failed to process data: ${error.message}`,
      //   error.stack,
      //   AppService.name,
      // );

      throw error;
    }
  }

  // 경고 로그 예시
  checkHealth() {
    const memoryUsage = process.memoryUsage();
    const memoryMB = Math.round(memoryUsage.heapUsed / 1024 / 1024);

    if (memoryMB > 100) {
      this.logger.warn(
        `High memory usage detected: ${memoryMB}MB`,
        AppService.name,
      );
    }

    this.logger.log('Health check completed', AppService.name);

    return {
      status: 'ok',
      memory: `${memoryMB}MB`,
      uptime: process.uptime(),
    };
  }
}
