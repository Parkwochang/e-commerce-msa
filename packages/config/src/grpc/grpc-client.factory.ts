import { ClientOptions, Transport } from '@nestjs/microservices';

export interface GrpcClientOptions {
  name: string;
  url: string;
  protoPath: string;
  packageName: string;
}

export function createGrpcClient(config: GrpcClientOptions): ClientOptions {
  const [host, port] = config.url.split(':');

  return {
    name: config.name,
    transport: Transport.GRPC,
    options: {
      url: config.url,
      package: config.packageName,
      protoPath: config.protoPath,
      loader: {
        keepCase: true,
        longs: String,
        enums: String,
        defaults: true,
        oneofs: true,
      },
    },
  };
}
