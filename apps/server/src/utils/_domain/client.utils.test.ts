import { describe, expect, it } from 'vitest';

import { normalizeClientEmail } from './client.utils';

describe('the e-mail address a client is known by', () => {
  it('should give the same address for two spellings that differ only by case', () => {
    expect(normalizeClientEmail('Jean.Dupont@Example.COM')).toBe(normalizeClientEmail('jean.dupont@example.com'));
  });

  it('should drop the spaces typed around the address', () => {
    expect(normalizeClientEmail('  jean@example.com ')).toBe('jean@example.com');
  });

  it('should leave an address already in its stored form unchanged', () => {
    expect(normalizeClientEmail('jean@example.com')).toBe('jean@example.com');
  });
});
