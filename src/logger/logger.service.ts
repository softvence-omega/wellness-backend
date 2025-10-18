import { Injectable, LoggerService } from '@nestjs/common';
import { winstonLogger } from './winston.config';

@Injectable()
export class CustomLogger implements LoggerService {
  log(message: string, context?: string, meta?: any) {
    winstonLogger.info(message, { context, ...meta });
  }

  error(message: string, trace?: string, context?: string, meta?: any) {
    winstonLogger.error(message, { trace, context, ...meta });
  }

  warn(message: string, context?: string, meta?: any) {
    winstonLogger.warn(message, { context, ...meta });
  }

  debug(message: string, context?: string, meta?: any) {
    winstonLogger.debug(message, { context, ...meta });
  }

  verbose(message: string, context?: string, meta?: any) {
    winstonLogger.verbose(message, { context, ...meta });
  }
}