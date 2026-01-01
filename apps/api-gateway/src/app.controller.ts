import {
  Controller,
  Get,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  LoggerService,
} from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly logger: LoggerService,
  ) {
    this.logger.log('AppController initialized', AppController.name);
  }

  @Get()
  getHello(): string {
    this.logger.log('GET / - Hello endpoint called', AppController.name);
    return this.appService.getHello();
  }

  @Get('health')
  @HttpCode(HttpStatus.OK)
  healthCheck() {
    this.logger.log('GET /health - Health check requested', AppController.name);
    return this.appService.checkHealth();
  }

  @Post('data')
  @HttpCode(HttpStatus.CREATED)
  async processData(@Body() body: any) {
    this.logger.log(
      'POST /data - Data processing requested',
      AppController.name,
    );
    this.logger.log(
      `Request body received with keys: ${Object.keys(body).join(', ')}`,
      AppController.name,
    );

    try {
      const result = await this.appService.processData(body);
      this.logger.log('Data processed successfully', AppController.name);
      return result;
    } catch (error) {
      // this.logger.error(
      //   `Data processing failed: ${error.message}`,
      //   error.stack,
      //   AppController.name,
      // );
      throw error;
    }
  }
}
