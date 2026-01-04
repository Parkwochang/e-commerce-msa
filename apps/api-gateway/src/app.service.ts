import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class AppService {
  private readonly logger = new Logger(AppService.name);

  constructor() {
    // 서비스 초기화 로그
    this.logger.log('AppService initialized');
  }

  getHello(): string {
    // 클래스별 Logger 사용 (context 자동 포함!)
    this.logger.log('getHello() called');
    this.logger.log('Processing hello request');

    return 'Hello World!';
  }

  // 에러 처리 예시
  async processData(data: any) {
    try {
      this.logger.log('Processing data...');

      // 비즈니스 로직...
      if (!data) {
        throw new Error('Data is required');
      }

      this.logger.log('Data processed successfully');

      return { success: true, data };
    } catch (error) {
      // 에러 로그 (스택 트레이스 자동 포함)
      // this.logger.error(
      //   `Failed to process data: ${error.message}`,
      //   error.stack,
      // );

      throw error;
    }
  }

  // 경고 로그 예시
  checkHealth() {
    const memoryUsage = process.memoryUsage();
    const memoryMB = Math.round(memoryUsage.heapUsed / 1024 / 1024);

    if (memoryMB > 100) {
      this.logger.warn(`High memory usage detected: ${memoryMB}MB`);
    }

    this.logger.debug?.('Health check completed');

    return {
      status: 'ok',
      memory: `${memoryMB}MB`,
      uptime: process.uptime(),
    };
  }
}
