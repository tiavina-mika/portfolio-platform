import { AsyncLocalStorage } from 'async_hooks';

type RequestContext = {
  correlationId: string;
  // Cloud Run trace id of the request (absent for jobs and off Cloud Run)
  traceId?: string;
};

const asyncLocalStorage = new AsyncLocalStorage<RequestContext>();

/*
 * Runs `fn` with a correlationId bound to the current async execution chain (HTTP request →
 * Cloud Function → trigger → job) — getCorrelationId() below reads it back from anywhere in that
 * chain without threading it through every function signature.
 */
export const runWithCorrelationId = <T>(correlationId: string, fn: () => T, traceId?: string): T =>
  asyncLocalStorage.run({ correlationId, traceId }, fn);

export const getCorrelationId = (): string | undefined => asyncLocalStorage.getStore()?.correlationId;

export const getTraceId = (): string | undefined => asyncLocalStorage.getStore()?.traceId;
