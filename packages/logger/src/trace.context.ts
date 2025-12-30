import { AsyncLocalStorage } from 'async_hooks';

export const traceContext = new AsyncLocalStorage<{ traceId: string }>();

export const setTraceContext = (traceId: string) => {
  traceContext.enterWith({ traceId });
};

export const getTraceContext = () => {
  return traceContext.getStore();
};
