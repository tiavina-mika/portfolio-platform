import { existsSync, mkdirSync } from 'fs';
import { createRequire } from 'module';
import path from 'path';
import { fileURLToPath } from 'url';

import winston from 'winston';
import WinstonDaily from 'winston-daily-rotate-file';

import { IS_CLOUD_RUN, IS_PROD } from '@/constants/_core/constants';

import { getCorrelationId, getTraceId } from './request-context.utils';

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

const logDir = path.join(dirname, '../logs');

/*
 * Cloud Run's disk is ephemeral/in-memory and is wiped on every recycle and scale-to-zero, so
 * writing rotated files there is pointless — this directory is only
 * needed on hosts where the WinstonDaily transports below actually run.
 */
if (!IS_CLOUD_RUN && !existsSync(logDir)) {
  mkdirSync(logDir);
}

/*
 * Loaded behind the same flag that decides whether it is used: the package drags in the whole
 * Google Cloud auth/gRPC tree, thousands of modules that a local start paid for on every single
 * tsx-watch restart — minutes of module resolution before the process could bind its port — to
 * build a transport only Cloud Run ever constructs. Off Cloud Run it is now never read from disk.
 * Resolved through createRequire rather than `await import()` so this module stays free of
 * top-level await, which cannot be transpiled to CommonJS (the form Jest loads it in).
 */
const loadCloudRunLogging = (): typeof import('@google-cloud/logging-winston') =>
  createRequire(import.meta.url)('@google-cloud/logging-winston');

const cloudRunTransport = IS_CLOUD_RUN
  /*
   * handleExceptions: an uncaughtException is logged as a structured ERROR before the process
   * exits, instead of leaving only Node's raw stderr dump in Cloud Logging
   */
  ? new (loadCloudRunLogging().LoggingWinston)({ redirectToStdout: true, handleExceptions: true })
  : undefined;

// Human-readable format — Console transport only
const consoleLogFormat = winston.format.printf(({
  timestamp, level, message, ...meta
}: {
  timestamp?: string; level: string; message: any; [key: string]: any;
}) => {
  let newMessage: string = message;

  if (message && typeof message === 'object') {
    newMessage = JSON.stringify(newMessage, null, '\t');
  }

  const metaKeys = Object.keys(meta).filter((key) => key !== 'splat');
  const metaString = metaKeys.length
    ? ` ${JSON.stringify(Object.fromEntries(metaKeys.map((key) => [key, meta[key]])))}`
    : '';

  return `${timestamp} ${level}: ${newMessage}${metaString}`;
});

/*
 * Cloud Logging only groups a log under its request when `trace` is the full
 * "projects/<id>/traces/<traceId>" form, so the GCP project id is needed. It is not in the
 * environment: it is read once from the Cloud Run metadata server (fire-and-forget — until it
 * resolves, or if it fails, logs simply go out without the trace link).
 */
let gcpProjectId: string | undefined;

if (IS_CLOUD_RUN) {
  fetch('http://metadata.google.internal/computeMetadata/v1/project/project-id', {
    headers: { 'Metadata-Flavor': 'Google' },
  })
    .then((response) => response.text())
    .then((projectId) => {
      gcpProjectId = projectId;
    })
    .catch(() => undefined);
}

// injects the current request/job correlationId (see request-context.utils.ts) into every log line
const correlationIdFormat = winston.format((info) => {
  const correlationId = getCorrelationId();
  const traceId = getTraceId();

  if (correlationId) {
    info.correlationId = correlationId;
  }
  if (traceId && gcpProjectId) {
    info['logging.googleapis.com/trace'] = `projects/${gcpProjectId}/traces/${traceId}`;
  }
  return info;
});

// Structured JSON format — file transports, queryable by log management tools
const fileLogFormat = winston.format.combine(
  // unwraps Error.message/Error.stack into enumerable fields when an Error is logged directly
  winston.format.errors({ stack: true }),
  correlationIdFormat(),
  winston.format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss',
  }),
  winston.format.json()
);

/*
 * Log Level
 * error: 0, warn: 1, info: 2, http: 3, verbose: 4, debug: 5, silly: 6
 */
const logger = winston.createLogger({
  level: IS_PROD ? 'info' : 'debug',
  // applies to any transport that doesn't set its own `format` (the Cloud Run transport below)
  format: winston.format.combine(
    winston.format.errors({ stack: true }),
    correlationIdFormat()
  ),
  transports: cloudRunTransport
    ? [
      /*
       * Cloud Run instances are short-lived and their disk is ephemeral — the WinstonDaily
       * file transports below would silently lose everything on every recycle/scale-to-zero.
       * `redirectToStdout` writes structured JSON to stdout instead, which Cloud Run's built-in
       * logging agent picks up and forwards to Cloud Logging, keeping the level → severity
       * mapping and the trace correlation the structured payload carries.
       */
      cloudRunTransport,
    ]
    : [
      // debug log setting
      new WinstonDaily({
        level: IS_PROD ? 'info' : 'debug',
        datePattern: 'YYYY-MM-DD',
        dirname: logDir + '/debug', // log file /logs/debug/*.log in save
        filename: '%DATE%.log',
        maxFiles: 30, // 30 Days saved
        maxSize: '20m', // avoid unbounded growth between daily rotations
        format: fileLogFormat,
        zippedArchive: true,
      }),
      // error log setting
      new WinstonDaily({
        level: 'error',
        datePattern: 'YYYY-MM-DD',
        dirname: logDir + '/error', // log file /logs/error/*.log in save
        filename: '%DATE%.log',
        maxFiles: 30, // 30 Days saved
        maxSize: '20m', // avoid unbounded growth between daily rotations
        handleExceptions: true,
        format: fileLogFormat,
        zippedArchive: true,
      }),
    ],
});

if (!IS_CLOUD_RUN) {
  /*
   * colorize() is for a human tailing a local/current-host log stream — on Cloud Run the
   * LoggingWinston transport above already writes plain structured JSON to stdout.
   */
  logger.add(
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.errors({ stack: true }),
        correlationIdFormat(),
        winston.format.timestamp({
          format: 'YYYY-MM-DD HH:mm:ss',
        }),
        winston.format.colorize(),
        consoleLogFormat
      ),
      /**
       * disable winston logger in test mode
       * @NOTE the console.log will still be displayed
       * @see https://github.com/winstonjs/winston/issues/1907
       */
      silent: process.env.NODE_ENV === 'test',
    })
  );
}

process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled promise rejection', { error: (reason as Error)?.stack ?? reason });
});

export { logger };
