import {
  CLIENT_ADDRESS_LINE_MAX_LENGTH, CLIENT_EMAIL_MAX_LENGTH, CLIENT_NAME_MAX_LENGTH, CLIENT_NOTES_MAX_LENGTH,
  CLIENT_PHONE_MAX_LENGTH, CLIENT_TAX_ID_MAX_LENGTH,
} from '@shared/domain-constants';
import { ClientKindEnum } from '@shared/domain-types';
import { z } from 'zod';

import { tabRouteSearchParams } from '@/validations/_core/app.validations';

export const clientsRouteSearchParams = tabRouteSearchParams;

export type ClientsRouteSearchParams = z.infer<typeof clientsRouteSearchParams>;

const optionalTextSchema = (max: number) => z.string().trim().max(max).optional();

export const clientSchema = z.object({
  name: z.string().trim().min(1).max(CLIENT_NAME_MAX_LENGTH),
  kind: z.enum(ClientKindEnum),
  email: z.string().trim().max(CLIENT_EMAIL_MAX_LENGTH).pipe(z.email()),
  phone: optionalTextSchema(CLIENT_PHONE_MAX_LENGTH),
  address: z.object({
    line1: optionalTextSchema(CLIENT_ADDRESS_LINE_MAX_LENGTH),
    line2: optionalTextSchema(CLIENT_ADDRESS_LINE_MAX_LENGTH),
    postalCode: optionalTextSchema(CLIENT_ADDRESS_LINE_MAX_LENGTH),
    city: optionalTextSchema(CLIENT_ADDRESS_LINE_MAX_LENGTH),
    country: optionalTextSchema(CLIENT_ADDRESS_LINE_MAX_LENGTH),
  }).optional(),
  taxId: optionalTextSchema(CLIENT_TAX_ID_MAX_LENGTH),
  notes: optionalTextSchema(CLIENT_NOTES_MAX_LENGTH),
});

export const clientFilterSchema = z.object({
  kind: z.enum(ClientKindEnum).optional(),
});

export type ClientFiltersInput = z.infer<typeof clientFilterSchema>;
