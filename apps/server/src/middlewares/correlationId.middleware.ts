import crypto from 'crypto';

import type { NextFunction, Request, Response } from 'express';

import { runWithCorrelationId } from '@/utils/_core/request-context.utils';

const CORRELATION_ID_HEADER = 'x-correlation-id';
// Cloud Run sets it as "TRACE_ID/SPAN_ID;o=OPTIONS"
const CLOUD_TRACE_HEADER = 'x-cloud-trace-context';

const parseTraceId = (header?: string): string | undefined => {
  const traceId = header?.split('/')[0];

  return traceId || undefined;
};

/*
 * Binds a correlationId to the request's async execution chain (see request-context.utils.ts) so
 * every log emitted while handling this request — including inside Parse Cloud Functions/triggers
 * mounted under /parse, since they run within the same request's async chain — carries the same id.
 */
const correlationIdMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const correlationId = crypto.randomUUID();

  res.setHeader(CORRELATION_ID_HEADER, correlationId);
  runWithCorrelationId(correlationId, next, parseTraceId(req.header(CLOUD_TRACE_HEADER)));
};

export default correlationIdMiddleware;
