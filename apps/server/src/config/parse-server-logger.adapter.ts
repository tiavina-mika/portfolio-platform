import { logger } from '@/utils/_core/logger';

/*
 * Parse Server's LoggerController calls adapter.log(level, ...originalArgs) — the same variadic
 * shape winston.Logger#log accepts (level, message, meta, callback) — so forwarding straight into
 * the app's own logger merges Parse Server's internal logs (CLP rejections, schema errors, trigger
 * exceptions raised by Parse itself) into the same files/format as the rest of the app, instead of
 * a second invisible pipeline written to its own default parse-server.{info,err} files.
 */
export class ParseServerLoggerAdapter {
  log(...args: unknown[]): void {
    (logger.log as (...logArgs: unknown[]) => void)(...args);
  }
}
