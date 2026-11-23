import { ClientKindEnum } from '@shared/domain-types';
import { describe, expect, it } from 'vitest';

import { CLIENT_LIST_MAX_LIMIT } from '@/constants/_domain/client.constants';

import {
  archiveClientSchema, createClientSchema, getClientsSchema, updateClientSchema,
} from './client.validations';

const validClient = {
  name: 'Studio North',
  kind: ClientKindEnum.COMPANY,
  email: 'contact@north.example',
};

describe('creating a client from the back-office', () => {
  it('should accept a client with only its name, kind and e-mail', () => {
    expect(createClientSchema.safeParse(validClient).success).toBe(true);
  });

  it('should refuse a client with no name', () => {
    expect(createClientSchema.safeParse({ ...validClient, name: '   ' }).success).toBe(false);
  });

  it('should refuse an address that is not an e-mail', () => {
    expect(createClientSchema.safeParse({ ...validClient, email: 'north' }).success).toBe(false);
  });

  it('should refuse a kind that does not exist', () => {
    expect(createClientSchema.safeParse({ ...validClient, kind: 'partner' }).success).toBe(false);
  });

  it('should refuse a status sent with the form, which only archiving may change', () => {
    expect(createClientSchema.safeParse({ ...validClient, status: 'archived' }).success).toBe(false);
  });

  it('should refuse a column the server owns', () => {
    expect(createClientSchema.safeParse({ ...validClient, createdBy: 'abc' }).success).toBe(false);
  });

  it('should turn empty optional boxes into nothing to store', () => {
    const result = createClientSchema.parse({ ...validClient, phone: '  ', taxId: '', notes: undefined });

    expect(result.phone).toBeNull();
    expect(result.taxId).toBeNull();
    expect(result.notes).toBeNull();
  });

  it('should keep only the lines of the address that were filled in', () => {
    const result = createClientSchema.parse({
      ...validClient,
      address: { line1: ' 12 Garden Street ', line2: '', city: 'Antananarivo' },
    });

    expect(result.address).toEqual({ line1: '12 Garden Street', city: 'Antananarivo' });
  });

  it('should store no address when every line is empty', () => {
    const result = createClientSchema.parse({ ...validClient, address: { line1: '', city: ' ' } });

    expect(result.address).toBeNull();
  });

  it('should refuse an address line that is not one of the fixed keys', () => {
    expect(createClientSchema.safeParse({ ...validClient, address: { street: 'x' } }).success).toBe(false);
  });
});

describe('editing and archiving a client', () => {
  it('should need the id of the client edited', () => {
    expect(updateClientSchema.safeParse(validClient).success).toBe(false);
    expect(updateClientSchema.safeParse({ ...validClient, id: 'x1' }).success).toBe(true);
  });

  it('should say whether the client is archived or put back', () => {
    expect(archiveClientSchema.safeParse({ id: 'x1' }).success).toBe(false);
    expect(archiveClientSchema.safeParse({ id: 'x1', archived: false }).success).toBe(true);
  });
});

describe('listing the clients', () => {
  it('should refuse a page larger than the list allows', () => {
    const page = { skip: 0, limit: CLIENT_LIST_MAX_LIMIT + 1 };

    expect(getClientsSchema.safeParse(page).success).toBe(false);
  });

  it('should accept a page filtered on the archived clients', () => {
    const page = { skip: 0, limit: 25, filters: { status: 'archived' } };

    expect(getClientsSchema.safeParse(page).success).toBe(true);
  });
});
