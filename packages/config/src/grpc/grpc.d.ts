interface GrpcClientConfig {
  url: string;
  package: string;
  protoPath: string;
}

interface GrpcClientAsyncConfig {
  name: string;
  useFactory: (...args: any[]) => Promise<GrpcClientConfig> | GrpcClientConfig;
  inject?: any[];
}
