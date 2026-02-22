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
    const providers: Provider[] = options.map((option) => createGrpcClientProvider(option));

    return {
      module: GrpcModule,
      global: true,
      imports: options.flatMap((o) => o.imports || []),
      providers,
      exports: providers,
    };
  }
}
