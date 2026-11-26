import { TargetEnum } from '@shared/types';
import {
  describe, expect, it, vi,
} from 'vitest';

import { getStaffUserIdsHiddenFrom } from './userRole.service.cloud';

const { PORTFOLIO, AGENCY } = TargetEnum;

type StoredRole = { name: string; workspaces?: TargetEnum[]; userIds: string[] };

const STORED_ROLES: StoredRole[] = [
  { name: 'OWNER', userIds: ['portfolio-owner', 'owner-with-agency-post'] },
  { name: 'SUPER_ADMIN', userIds: ['super-admin'] },
  { name: 'MANAGER', userIds: ['portfolio-manager'] },
  { name: 'AGENCY_ADMIN', workspaces: [AGENCY], userIds: ['agency-admin', 'owner-with-agency-post'] },
];

// the `_Role` class, the only thing this reads
vi.hoisted(() => {
  type Filter = (role: StoredRole) => boolean;

  const toRole = (role: StoredRole) => ({
    getUsers: () => ({
      query: () => {
        const users = {
          select: () => users,
          each: (callback: (user: { id: string }) => void) => {
            role.userIds.forEach((id) => callback({ id }));
            return Promise.resolve();
          },
        };

        return users;
      },
    }),
  });

  class RoleQuery {
    filters: Filter[] = [];

    containedIn(field: 'name' | 'workspaces', values: string[]) {
      this.filters.push((role) => [role[field]].flat().some((value) => !!value && values.includes(value)));
      return this;
    }

    notContainedIn(field: 'name', values: string[]) {
      this.filters.push((role) => !values.includes(role[field]));
      return this;
    }

    select() {
      return this;
    }

    limit() {
      return this;
    }

    read() {
      return STORED_ROLES.filter((role) => this.filters.every((filter) => filter(role))).map(toRole);
    }

    find() {
      return Promise.resolve(this.read());
    }

    async each(callback: (role: ReturnType<typeof toRole>) => Promise<void>) {
      await Promise.all(this.read().map(callback));
    }
  }

  vi.stubGlobal('Parse', { Query: RoleQuery, Role: class {} });
});

// the neighbours of the service reach the database, the mailer and the triggers when they load
vi.mock('./ownerAlert.service.cloud', () => ({ alertOwners: vi.fn() }));
vi.mock('./roleAuditLog.service.cloud', () => ({ createRoleAuditLog: vi.fn() }));
vi.mock('../../triggers/_core/country-scope.triggers', () => ({ forgetAllowedCountriesOf: vi.fn() }));
vi.mock('../../utils/_core/email.utils.cloud', () => ({ sendEmailToUser: vi.fn() }));
vi.mock('../../utils/_core/mfa.utils.cloud', () => ({ getUserMfa: vi.fn() }));

describe('the staff hidden from a back-office reader', () => {
  it('should hide the staff of the portfolio, owners and super administrators included, in the agency', async () => {
    const hiddenIds = await getStaffUserIdsHiddenFrom([AGENCY]);

    expect(hiddenIds.sort()).toEqual(['portfolio-manager', 'portfolio-owner', 'super-admin']);
  });

  it('should keep an owner who also holds a post of the agency', async () => {
    expect(await getStaffUserIdsHiddenFrom([AGENCY])).not.toContain('owner-with-agency-post');
  });

  it('should hide nobody from a reader of the portfolio', async () => {
    expect(await getStaffUserIdsHiddenFrom([PORTFOLIO])).toEqual([]);
  });
});
