/**
 * inspired by https://dev.to/osalumense/validating-request-data-in-expressjs-using-zod-a-comprehensive-guide-3a0j
 */
import type { Request, Response, NextFunction } from 'express';


import { StatusCodes } from 'http-status-codes';
import isEmpty from 'lodash/isEmpty.js';
import { z, ZodError } from 'zod';

import type { Locale } from '@/types/app.type';

type SchemaParams = z.ZodObject<z.ZodRawShape> | ((locale: Locale) => z.ZodObject<z.ZodRawShape>);
type Input = {
  bodySchema?: SchemaParams;
  querySchema?: z.ZodObject<z.ZodRawShape>;
  paramsSchema?: z.ZodObject<z.ZodRawShape>;
};
export const validateApiInput = ({ bodySchema, querySchema, paramsSchema }: Input) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      // body
      if (bodySchema && !isEmpty(req.body)) {
        const { locale } = req.body;

        if (typeof bodySchema === 'function') {
          // translate error messages server side
          if (locale) {
            bodySchema(locale).parse(req.body);
          }
        }
        else {
          bodySchema.parse(req.body);
        }
      }

      // query
      if (querySchema && !isEmpty(req.query)) {
        querySchema.parse(req.query);
      }

      // params
      if (paramsSchema && !isEmpty(req.params)) {
        paramsSchema.parse(req.params);
      }
      next();
    }
    catch (error) {
      if (error instanceof ZodError) {
        const errorMessages = error.issues.map((issue: any) => ({
          // mainly translated key
          message: issue.message,
          key: issue.path.join('.'),
        }));

        res.status(StatusCodes.BAD_REQUEST).json({ error: 'Invalid data', details: errorMessages });
      }
      else {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Internal Server Error' });
      }
    }
  };
};
