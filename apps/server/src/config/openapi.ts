import { LANGUAGE_CODES } from '@shared/constants';
import {
  extendZodWithOpenApi, OpenAPIRegistry, OpenApiGeneratorV31,
} from '@asteasolutions/zod-to-openapi';
import { z } from 'zod';

import { downloadFileInputSchema } from '@/validations/_core/util.validations';

/*
 * Description of the Express routes the server exposes next to Parse (`/files`, `/download`,
 * `/ping`). The Parse Cloud Functions are called through the Parse SDK, not as REST resources, so they
 * are not described here. The document is served on `/openapi.json` outside production.
 */
extendZodWithOpenApi(z);

const registry = new OpenAPIRegistry();

const apiKey = registry.registerComponent('securitySchemes', 'apiKey', {
  type: 'apiKey',
  in: 'header',
  name: 'X-portfolio-key',
  description: 'Value of the server REST_API_KEY, sent by every client.',
});
const sessionToken = registry.registerComponent('securitySchemes', 'sessionToken', {
  type: 'apiKey',
  in: 'header',
  name: 'X-Parse-Session-Token',
  description: 'Session token of the signed-in user (also accepted as the `sessionToken` query param).',
});

const errorSchema = registry.register(
  'Error',
  z.object({ message: z.string() }).openapi({ example: { message: 'Missing "X-portfolio-key" params' } })
);

const errorResponse = (description: string) => ({
  description,
  content: { 'application/json': { schema: errorSchema } },
});

const uploadedFileSchema = registry.register(
  'UploadedFile',
  z.object({ publicId: z.string(), url: z.string().url() })
);

registry.registerPath({
  method: 'get',
  path: '/ping',
  summary: 'Wake the server up',
  description: 'Called by a cron job every 14 minutes so the host never idles the server.',
  tags: ['Health'],
  responses: {
    200: { description: 'The server is awake', content: { 'text/plain': { schema: z.literal('pong') } } },
  },
});

registry.registerPath({
  method: 'post',
  path: '/files',
  summary: 'Upload files',
  description: 'Uploads one or several files; the response is always an array, even for a single file.',
  tags: ['Files'],
  security: [{ [apiKey.name]: [], [sessionToken.name]: [] }],
  request: {
    body: {
      required: true,
      content: {
        'multipart/form-data': {
          schema: z.object({
            files: z.array(z.string().openapi({ type: 'string', format: 'binary' })),
            folder: z.string().optional(),
            userId: z.string().optional(),
            config: z.string().optional().openapi({
              description: 'JSON-stringified Cloudinary upload options',
            }),
            validation: z.string().optional().openapi({
              description: 'JSON-stringified client validation, e.g. { "maxFileSize": 5 }',
            }),
            locale: z.enum(LANGUAGE_CODES).optional(),
          }),
        },
      },
    },
  },
  responses: {
    201: {
      description: 'The uploaded files',
      content: { 'application/json': { schema: z.array(uploadedFileSchema) } },
    },
    400: errorResponse('Invalid files, or missing or invalid credentials'),
    413: errorResponse('A file is too large or there are too many files'),
    429: errorResponse('Rate limit reached'),
  },
});

registry.registerPath({
  method: 'get',
  path: '/download/cv.pdf',
  summary: 'Download the CV',
  description: 'Streams the PDF stored under `publicId`; opened directly from the browser.',
  tags: ['Files'],
  request: { query: downloadFileInputSchema },
  responses: {
    200: { description: 'The PDF file', content: { 'application/pdf': { schema: z.string().openapi({ format: 'binary' }) } } },
    400: errorResponse('File not found'),
  },
});

export const buildOpenApiDocument = () => new OpenApiGeneratorV31(registry.definitions).generateDocument({
  openapi: '3.1.0',
  info: {
    title: 'Portfolio server',
    version: '1.0.0',
    description: 'REST routes of the Portfolio server. The rest of the API is Parse (`/parse`).',
  },
  servers: [{ url: '/' }],
});
