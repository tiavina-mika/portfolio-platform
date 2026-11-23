import {
  CLIENT_ADDRESS_LINE_MAX_LENGTH, CLIENT_EMAIL_MAX_LENGTH, CLIENT_NAME_MAX_LENGTH, CLIENT_NOTES_MAX_LENGTH,
  CLIENT_PHONE_MAX_LENGTH, CLIENT_TAX_ID_MAX_LENGTH,
} from '@shared/domain-constants';
import { ClientKindEnum, ClientStatusEnum } from '@shared/domain-types';
import { z } from 'zod';

import { CLIENT_LIST_MAX_LIMIT } from '@/constants/_domain/client.constants';

import {
  localeFieldSchema, objectIdFieldSchema, paginationQuerySchema, workspaceFieldSchema,
} from '../_core/util.validations';

/*
 * an optional text: an empty box comes back as `null`, which unsets the column instead of storing an
 * empty string next to the clients that never had one
 */
const optionalTextSchema = (max: number) => z.string()
  .trim()
  .max(max)
  .nullish()
  .transform((value) => value || null);

const clientAddressSchema = z.strictObject({
  line1: optionalTextSchema(CLIENT_ADDRESS_LINE_MAX_LENGTH),
  line2: optionalTextSchema(CLIENT_ADDRESS_LINE_MAX_LENGTH),
  postalCode: optionalTextSchema(CLIENT_ADDRESS_LINE_MAX_LENGTH),
  city: optionalTextSchema(CLIENT_ADDRESS_LINE_MAX_LENGTH),
  country: optionalTextSchema(CLIENT_ADDRESS_LINE_MAX_LENGTH),
})
  .nullish()
  // the lines left empty are dropped, and an address with no line at all is no address
  .transform((address) => {
    const lines = Object.entries(address ?? {}).filter(([, value]) => !!value);

    return lines.length ? Object.fromEntries(lines) : null;
  });

/*
 * the fields a back-office user types. Strict: the status, the authors and any other column the
 * server owns are refused rather than silently stored, so a faulty or forged call cannot impose them
 */
const clientFieldsSchema = {
  name: z.string().trim().min(1).max(CLIENT_NAME_MAX_LENGTH),
  kind: z.enum(ClientKindEnum),
  email: z.string().trim().max(CLIENT_EMAIL_MAX_LENGTH).pipe(z.email()),
  phone: optionalTextSchema(CLIENT_PHONE_MAX_LENGTH),
  address: clientAddressSchema,
  taxId: optionalTextSchema(CLIENT_TAX_ID_MAX_LENGTH),
  notes: optionalTextSchema(CLIENT_NOTES_MAX_LENGTH),
};

/**
 * the typed fields alone, read off an already validated request: the other params (`id`, `locale`…)
 * are dropped, and the values come out trimmed with their empty boxes turned into `null`
 */
export const clientInputSchema = z.object(clientFieldsSchema);

// sent by every back-office call: the language of the error messages and the workspace worked in
const requestFieldsSchema = {
  locale: localeFieldSchema.optional(),
  workspace: workspaceFieldSchema,
};

export const createClientSchema = z.strictObject({
  ...clientFieldsSchema,
  ...requestFieldsSchema,
});

export const updateClientSchema = z.strictObject({
  id: objectIdFieldSchema,
  ...clientFieldsSchema,
  ...requestFieldsSchema,
});

export const archiveClientSchema = z.strictObject({
  id: objectIdFieldSchema,
  // false puts a client archived by mistake back in the list
  archived: z.boolean(),
  ...requestFieldsSchema,
});

export const getClientSchema = z.strictObject({
  id: objectIdFieldSchema,
  ...requestFieldsSchema,
});

const clientsFiltersSchema = z.object({
  status: z.enum(ClientStatusEnum).optional(),
}).optional();

const clientsSearchSchema = z.object({
  // the search box: a part of the name or of the e-mail
  text: z.string().optional(),
  kind: z.enum(ClientKindEnum).optional(),
}).optional();

export const getClientsSchema = paginationQuerySchema.extend({
  limit: z.coerce.number().int().nonnegative().max(CLIENT_LIST_MAX_LIMIT),
  filters: clientsFiltersSchema,
  search: clientsSearchSchema,
  ...requestFieldsSchema,
});
