import { existsSync, mkdirSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import winston from 'winston';
import WinstonDaily from 'winston-daily-rotate-file';

// logs dir
const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);
const logDir = path.join(dirname, '../logs');

if (!existsSync(logDir)) {
  mkdirSync(logDir);
}

// Define log format
const logFormat = winston.format.printf((
  { timestamp, level, message }: { timestamp?: string; level: string; message: any }
) => {
  let newMessage: string = message;

  if (message && typeof message === 'object') {
    newMessage = JSON.stringify(newMessage, null, '\t');
  }

  return `${timestamp} ${level}: ${newMessage}`;
});

/*
 * Log Level
 * error: 0, warn: 1, info: 2, http: 3, verbose: 4, debug: 5, silly: 6
 */
const logger = winston.createLogger({
  format: winston.format.combine(
    winston.format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss',
    }),
    winston.format.colorize(),
    logFormat
  ),
  transports: [
    // debug log setting
    new WinstonDaily({
      level: 'debug',
      datePattern: 'YYYY-MM-DD',
      dirname: logDir + '/debug', // log file /logs/debug/*.log in save
      filename: '%DATE%.log',
      maxFiles: 30, // 30 Days saved
      json: false,
      zippedArchive: true,
    }),
    // error log setting
    new WinstonDaily({
      level: 'error',
      datePattern: 'YYYY-MM-DD',
      dirname: logDir + '/error', // log file /logs/error/*.log in save
      filename: '%DATE%.log',
      maxFiles: 30, // 30 Days saved
      handleExceptions: true,
      json: false,
      zippedArchive: true,
    }),
  ],
});

logger.add(
  new winston.transports.Console({
    format: winston.format.combine(winston.format.splat(), winston.format.colorize()),
  })
);

const stream = {
  write: (message: string): void => {
    logger.info(message.substring(0, message.lastIndexOf('\n')));
  },
};

export { logger, stream };
