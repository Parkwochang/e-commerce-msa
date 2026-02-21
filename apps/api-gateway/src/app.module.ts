import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
// pcakcage
import { LoggerModule, TraceInterceptor } from '@repo/logger';
import {
  ConfigModule,
  COMMON_CONFIG,
  GATEWAY_CONFIG,
  type CommonConfigType,
  type GatewayConfigType,
} from '@repo/config/env';
import { AuthModule } from '@repo/config/auth';
import { GRPC_PACKAGE, GRPC_SERVICE, GrpcModule } from '@repo/config/grpc';
import { PROTO_PATHS } from '@repo/proto';

import { AppController } from '@/app.controller';
import { AppService } from '@/app.service';
import { UserModule } from '@/user/user.module';

// ----------------------------------------------------------------------------

@Module({
  imports: [
    ConfigModule.forRoot({
      appType: 'api',
    }),
    LoggerModule.forRoot({
      serviceName: 'API_GATEWAY',
      disableFileLog: process.env.NODE_ENV === 'production',
    }),

    AuthModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const commonConfig = configService.get<CommonConfigType>(
          COMMON_CONFIG.KEY,
        );

        if (!commonConfig) {
          throw new Error('Common config is required');
        }

        return {
          secret: commonConfig.JWT_SECRET,
          expiresIn: commonConfig.JWT_EXPIRES_IN,
        };
      },
    }),

    GrpcModule.registerAsync([
      {
        name: GRPC_SERVICE.USER,
        useFactory: (configService: ConfigService) => {
          const gatewayConfig = configService.get<GatewayConfigType>(
            GATEWAY_CONFIG.KEY,
          );

          if (!gatewayConfig) {
            throw new Error('Gateway config is required');
          }

          return {
            url: gatewayConfig.USER_GRPC_URL,
            package: GRPC_PACKAGE.USER,
            protoPath: PROTO_PATHS.USER,
            inject: [ConfigService],
          };
        },
      },
    ]),
    // Feature Modules
    UserModule,
    // OrderModule, // ORDER_SERVICE가 활성화되면 주석 해제
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useClass: TraceInterceptor,
    },
  ],
})
export class AppModule {}
