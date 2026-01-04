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

  constructor(private readonly appService: AppService) {
    this.logger.log('AppController initialized');
  }

  @Get()
  getHello(): string {
    this.logger.log('GET / - Hello endpoint called');
    return this.appService.getHello();
  }

  @Get('health')
  @HttpCode(HttpStatus.OK)
  healthCheck() {
    this.logger.log('GET /health - Health check requested');
    return this.appService.checkHealth();
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
