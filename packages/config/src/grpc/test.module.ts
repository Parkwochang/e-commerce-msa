// grpc.module.ts

import { DynamicModule, Module, ModuleMetadata, Provider } from '@nestjs/common';
import { createGrpcClientProvider } from './grpc-client.factory';

interface GrpcClientAsyncOptions extends Pick<ModuleMetadata, 'imports'> {
  name: string;

  useFactory: (...args: any[]) => {
    url: string;
    package: string;
    protoPath: string;
  };

  inject?: any[];
}

@Module({})
export class GrpcModule {
  static registerAsync(options: GrpcClientAsyncOptions[]): DynamicModule {
    const providers: Provider[] = options.map((option) => {
      return {
        provide: option.name,
        useFactory: async (...args: any[]) => {
          const config = await option.useFactory(...args);

          return createGrpcClientProvider(option.name, config);
        },
        inject: option.inject || [],
      };
    });

    return {
      module: GrpcModule,
      imports: options.flatMap((o) => o.imports || []),
      providers,
      exports: providers,
    };
  }
}
