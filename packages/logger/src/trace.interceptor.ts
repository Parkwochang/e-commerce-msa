import{CallHandler,ExecutionContext,Injectable,NestInterceptor} from '@nestjs/common';
import { getTraceContext, setTraceContext, traceContext } from './trace.context';

@Injectable()
export class TraceInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const traceId = 

    return traceContext.run({traceId}, () => next.handle());
  }
}