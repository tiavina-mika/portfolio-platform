import crypto from 'crypto';

import { TargetEnum } from '@shared/types';
import ParseSdk from 'parse';
import {
  beforeAll, describe, expect, it, vi,
} from 'vitest';

import type * as MfaUtils from './mfa.utils.cloud';
import type { IMfa } from '@/types/auth.type';

let mfaUtils: typeof MfaUtils;

beforeAll(async () => {
  vi.stubEnv('CRYPTO_FIXED_FULL_KEY', crypto.randomBytes(32).toString('hex'));
  // the cloud utils read `Parse` as the global Parse Server defines it
  vi.stubGlobal('Parse', ParseSdk);
  mfaUtils = await import('./mfa.utils.cloud');
});

const enabledMfa = (secret: string): IMfa => ({ secret, enabled: true });

// the SDK's own typings and the global ones describe the same user class
const newUser = (): Parse.User => new ParseSdk.User() as unknown as Parse.User;

describe('the sign-in challenge of an account with a second factor', () => {
  it('should name the workspace the password was typed on', () => {
    const token = mfaUtils.createMfaChallengeToken('user1', TargetEnum.AGENCY);

    expect(mfaUtils.resolveMfaChallengeToken(token)).toEqual({ userId: 'user1', workspace: TargetEnum.AGENCY });
  });

  it('should refuse a challenge whose workspace was changed after it was signed', () => {
    const token = mfaUtils.createMfaChallengeToken('user1', TargetEnum.AGENCY);
    const [body, signature] = token.split('.') as [string, string];
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'));
    const forgedBody = Buffer
      .from(JSON.stringify({ ...payload, workspace: TargetEnum.PORTFOLIO }))
      .toString('base64url');

    expect(mfaUtils.resolveMfaChallengeToken(`${forgedBody}.${signature}`)).toBeUndefined();
  });
});

describe('the second factor of each workspace', () => {
  it('should keep the portfolio second factor in the column the accounts already enrolled use', () => {
    const user = newUser();

    user.set('mfa', enabledMfa('portfolio-secret'));

    expect(mfaUtils.getUserMfa(user, TargetEnum.PORTFOLIO)?.secret).toBe('portfolio-secret');
    expect(mfaUtils.getUserMfa(user, TargetEnum.AGENCY)).toBeUndefined();
  });

  it('should enable the agency second factor without touching the portfolio one', () => {
    const user = newUser();

    user.set('mfa', enabledMfa('portfolio-secret'));
    mfaUtils.setUserMfa(user, TargetEnum.AGENCY, enabledMfa('agency-secret'));

    expect(mfaUtils.getUserMfa(user, TargetEnum.AGENCY)?.secret).toBe('agency-secret');
    expect(mfaUtils.getUserMfa(user, TargetEnum.PORTFOLIO)?.secret).toBe('portfolio-secret');
  });

  it('should remove one workspace second factor and leave the other', () => {
    const user = newUser();

    mfaUtils.setUserMfa(user, TargetEnum.PORTFOLIO, enabledMfa('portfolio-secret'));
    mfaUtils.setUserMfa(user, TargetEnum.AGENCY, enabledMfa('agency-secret'));
    mfaUtils.setUserMfa(user, TargetEnum.AGENCY, undefined);

    expect(mfaUtils.getUserMfa(user, TargetEnum.AGENCY)).toBeUndefined();
    expect(mfaUtils.getUserMfa(user, TargetEnum.PORTFOLIO)?.enabled).toBe(true);
  });

  it('should name the authenticator entry after the workspace', () => {
    vi.stubEnv('AGENCY_APP_NAME', 'Agency');

    const portfolioUrl = mfaUtils.buildMfaOtpauthUrl('a@b.c', 'JBSWY3DPEHPK3PXP', TargetEnum.PORTFOLIO);
    const agencyUrl = mfaUtils.buildMfaOtpauthUrl('a@b.c', 'JBSWY3DPEHPK3PXP', TargetEnum.AGENCY);

    expect(agencyUrl).toContain('issuer=Agency');
    expect(portfolioUrl).not.toContain('issuer=Agency');
  });
});
