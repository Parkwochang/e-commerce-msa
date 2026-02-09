import {
  Controller,
  Get,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  private readonly logger = new Logger(AppController.name);

  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    this.logger.log('GET / - Hello endpoint called');
    return this.appService.getHello();
  }

  /**
   * 헬스체크 엔드포인트
   *
   * @description
   * Kubernetes, Docker, Load Balancer 등에서 서비스 상태를 체크할 때 사용
   * 예: GET http://localhost:3001/health
   */
  @Get('health')
  @HttpCode(HttpStatus.OK)
  healthCheck() {
    this.logger.log('GET /health - Health check requested');
    return this.appService.checkHealth();
  }

  /**
   * Readiness Probe (Kubernetes용)
   *
   * @description
   * 서비스가 트래픽을 받을 준비가 되었는지 체크
   * 예: GET http://localhost:3001/ready
   */
  @Get('ready')
  @HttpCode(HttpStatus.OK)
  readinessCheck() {
    this.logger.log('GET /ready - Readiness check requested');
    return {
      status: 'ready',
      service: 'auth-service',
      database: 'connected', // 실제로는 DB 연결 체크
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Liveness Probe (Kubernetes용)
   *
   * @description
   * 서비스가 살아있는지 체크 (응답 없으면 재시작)
   * 예: GET http://localhost:3001/live
   */
  @Get('live')
  @HttpCode(HttpStatus.OK)
  livenessCheck() {
    return { status: 'alive' };
  }

  @Post('data')
  @HttpCode(HttpStatus.CREATED)
  async processData(@Body() body: any) {
    this.logger.log('POST /data - Data processing requested');
    this.logger.log(
      `Request body received with keys: ${Object.keys(body).join(', ')}`,
    );

    try {
      const result = await this.appService.processData(body);
      this.logger.log('Data processed successfully');
      return result;
    } catch (error) {
      // this.logger.error(
      //   `Data processing failed: ${error.message}`,
      //   error.stack,
      // );
      throw error;
    }
  }
}
