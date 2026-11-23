import { DOMAIN_COLLECTIONS } from '@shared/domain-constants';
import { describe, expect, it } from 'vitest';

import { buildCLPForClass } from './security.service.cloud';

const readAndWriteRights = {
  find: true, get: true, create: true, update: true, delete: false, destroy: false,
};

const rolesGranting = (className: string) => [
  { name: 'aldaronSales', rights: [{ className, rights: readAndWriteRights }] },
];

describe('the class-level permissions built from the role rights', () => {
  it('should give a role the operations its rights grant on an ordinary class', () => {
    const { project } = DOMAIN_COLLECTIONS;
    const clp = buildCLPForClass(project, project, rolesGranting(project));

    expect(clp.find['role:aldaronSales']).toBe(true);
    expect(clp.create['role:aldaronSales']).toBe(true);
  });

  it('should give no role a raw access to the clients, reached only through their functions', () => {
    const { client } = DOMAIN_COLLECTIONS;
    const clp = buildCLPForClass(client, client, rolesGranting(client));

    for (const operation of ['find', 'get', 'count', 'create', 'update', 'addField']) {
      expect(clp[operation]?.['role:aldaronSales']).toBeUndefined();
    }
  });

  it('should open the clients to nobody signed out or merely signed in', () => {
    const { client } = DOMAIN_COLLECTIONS;
    const clp = buildCLPForClass(client, client, []);

    expect(clp.find['*']).toBeUndefined();
    expect(clp.find.requiresAuthentication).toBeUndefined();
    expect(clp.create['*']).toBeUndefined();
  });
});
