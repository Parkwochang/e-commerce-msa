import { Provider } from '@nestjs/common';
import { ClientGrpcProxy, ClientProxyFactory } from '@nestjs/microservices';

import { createGrpcOptions } from './grpc.options';

// ----------------------------------------------------------------------------

export const createGrpcClientProvider = (
  provide: string,
  options: {
    url: string;
    package: string;
    protoPath: string;
  },
): Provider => ({
  provide,
  useFactory: () => {
    return ClientProxyFactory.create(createGrpcOptions(options)) as unknown as ClientGrpcProxy;
  },
});
