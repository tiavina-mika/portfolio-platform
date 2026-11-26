import { TargetEnum } from '@shared/types';
import { describe, expect, it } from 'vitest';

import { getRoleNamesOutsideWorkspace, isWriteWithinWorkspaces } from './rights.utils';

const { PORTFOLIO, AGENCY } = TargetEnum;
const BOTH = [PORTFOLIO, AGENCY];

describe('a save made by an account limited to some workspaces', () => {
  describe('when a row is created', () => {
    it('should be allowed in a workspace the account opens', () => {
      expect(isWriteWithinWorkspaces(null, [AGENCY], [AGENCY])).toBe(true);
    });

    it('should be refused in a workspace the account does not open', () => {
      expect(isWriteWithinWorkspaces(null, [PORTFOLIO], [AGENCY])).toBe(false);
    });

    it('should be read as the portfolio when the row names no target', () => {
      expect(isWriteWithinWorkspaces(null, [], [AGENCY])).toBe(false);
      expect(isWriteWithinWorkspaces(null, undefined, [PORTFOLIO])).toBe(true);
    });

    it('should be refused when the row is also published where the account cannot work', () => {
      expect(isWriteWithinWorkspaces(null, BOTH, [AGENCY])).toBe(false);
    });
  });

  describe('when a row is changed', () => {
    it('should be allowed on a row of the account\'s workspace', () => {
      expect(isWriteWithinWorkspaces([AGENCY], [AGENCY], [AGENCY])).toBe(true);
    });

    it('should be refused on a row of another workspace, even when its targets are left alone', () => {
      expect(isWriteWithinWorkspaces([PORTFOLIO], [PORTFOLIO], [AGENCY])).toBe(false);
    });

    it('should be refused on a row saved before the field existed when the account is agency-only', () => {
      expect(isWriteWithinWorkspaces([], [], [AGENCY])).toBe(false);
    });

    it('should be allowed on a row shared with the other workspace while that side is left as it was', () => {
      expect(isWriteWithinWorkspaces(BOTH, BOTH, [AGENCY])).toBe(true);
    });

    it('should be refused when it adds the workspace the account does not open', () => {
      expect(isWriteWithinWorkspaces([AGENCY], BOTH, [AGENCY])).toBe(false);
    });

    it('should be allowed when it takes its own workspace off a shared row', () => {
      expect(isWriteWithinWorkspaces(BOTH, [PORTFOLIO], [AGENCY])).toBe(true);
    });

    it('should be refused when it takes the other workspace off a shared row', () => {
      expect(isWriteWithinWorkspaces(BOTH, [AGENCY], [AGENCY])).toBe(false);
    });

    it('should be allowed anywhere for an account that opens both workspaces', () => {
      expect(isWriteWithinWorkspaces([PORTFOLIO], [AGENCY], BOTH)).toBe(true);
    });
  });
});

describe('the posts left out of a workspace', () => {
  const roles = [
    { name: 'OWNER' },
    { name: 'SUPER_ADMIN' },
    { name: 'MANAGER' },
    { name: 'AGENCY_ADMIN', workspaces: [TargetEnum.AGENCY] },
    { name: 'BOTH', workspaces: [TargetEnum.PORTFOLIO, TargetEnum.AGENCY] },
  ];

  it('should leave the posts of the portfolio, old ones included, out of the agency', () => {
    expect(getRoleNamesOutsideWorkspace(roles, TargetEnum.AGENCY)).toEqual(['MANAGER']);
  });

  it('should leave the posts of the agency out of the portfolio', () => {
    expect(getRoleNamesOutsideWorkspace(roles, TargetEnum.PORTFOLIO)).toEqual(['AGENCY_ADMIN']);
  });
});
