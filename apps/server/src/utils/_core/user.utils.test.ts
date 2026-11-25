import { DEFAULT_ROLES, HIGHEST_LEVEL_ROLES } from '@shared/constants';
import {
  afterEach, beforeEach, describe, expect, it, vi,
} from 'vitest';

import { getBootstrapRoleName } from './user.utils';

describe('role given to an address on an owners allowlist', () => {
  beforeEach(() => {
    vi.stubEnv('OWNERS_EMAILS', 'Owner@portfolio.test, second@portfolio.test');
    vi.stubEnv('AGENCY_OWNERS_EMAILS', 'admin@agency.test,owner@portfolio.test');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('should give the owner role to an address of OWNERS_EMAILS, however it is cased', () => {
    expect(getBootstrapRoleName('owner@PORTFOLIO.test')).toBe(HIGHEST_LEVEL_ROLES[0]);
  });

  it('should give the agency administrator role to an address of AGENCY_OWNERS_EMAILS only', () => {
    expect(getBootstrapRoleName('admin@agency.test')).toBe(DEFAULT_ROLES[5]);
  });

  it('should keep an address listed in both lists an owner', () => {
    expect(getBootstrapRoleName('owner@portfolio.test')).toBe(HIGHEST_LEVEL_ROLES[0]);
  });

  it('should give no role to any other address, or to none', () => {
    expect(getBootstrapRoleName('someone@else.test')).toBeUndefined();
    expect(getBootstrapRoleName(undefined)).toBeUndefined();
  });
});
