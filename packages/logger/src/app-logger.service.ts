import { Inject, Injectable, Scope } from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import type { Logger } from 'winston';

// ----------------------------------------------------------------------------

type LogMeta = Record<string, unknown>;

@Injectable({ scope: Scope.TRANSIENT })
export class AppLogger {
  private context = 'Application';

  constructor(
    @Inject(WINSTON_MODULE_PROVIDER)
    private readonly logger: Logger,
  ) {}

  setContext(context: string): this {
    this.context = context;
    return this;
  }

  info(message: string, meta?: LogMeta): void {
    this.logger.info(message, this.withContext(meta));
  }

  warn(message: string, meta?: LogMeta): void {
    this.logger.warn(message, this.withContext(meta));
  }

  debug(message: string, meta?: LogMeta): void {
    this.logger.debug(message, this.withContext(meta));
  }

  verbose(message: string, meta?: LogMeta): void {
    this.logger.verbose(message, this.withContext(meta));
  }

  error(message: string, errorOrMeta?: Error | string | LogMeta, meta?: LogMeta): void {
    if (errorOrMeta instanceof Error) {
      this.logger.error(message, this.withContext({ ...meta, error: errorOrMeta.message, stack: errorOrMeta.stack }));
      return;
    }

    if (typeof errorOrMeta === 'string') {
      this.logger.error(message, this.withContext({ ...meta, error: errorOrMeta }));
      return;
    }

    this.logger.error(message, this.withContext(errorOrMeta));
  }

  private withContext(meta?: LogMeta): LogMeta {
    return {
      context: this.context,
      ...(meta ?? {}),
    };
  }
}
