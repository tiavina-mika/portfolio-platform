import { TargetEnum } from '@shared/types';
import {
  afterEach, beforeEach, describe, expect, it, vi,
} from 'vitest';

import { getAdminEmailSender } from './user.utils';
import {
  getAppName, getBrevoApiKey, getClientUrl, getRequestWorkspace, getServerUrl,
} from './utils';
import { APP_NAME } from '../../constants/_core/constants';

describe('workspace of the address a request comes from', () => {
  beforeEach(() => {
    vi.stubEnv('AGENCY_SERVER_URL', 'https://admin.agency.test');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('should be the agency when the page was opened on the agency back-office', () => {
    expect(getRequestWorkspace({ headers: { origin: 'https://admin.agency.test' } })).toBe(TargetEnum.AGENCY);
  });

  it('should read the host when the request carries no origin', () => {
    expect(getRequestWorkspace({ headers: { host: 'admin.agency.test' } })).toBe(TargetEnum.AGENCY);
    expect(getRequestWorkspace({ headers: { 'x-forwarded-host': 'admin.agency.test, proxy.internal' } }))
      .toBe(TargetEnum.AGENCY);
  });

  it('should say nothing for the portfolio address, so the roles of the account decide', () => {
    const headers = { origin: 'https://portfolio.test', host: 'portfolio.test' };

    expect(getRequestWorkspace({ headers })).toBeUndefined();
  });

  it('should say nothing for a call made by the server itself', () => {
    expect(getRequestWorkspace(undefined)).toBeUndefined();
    expect(getRequestWorkspace({ headers: {} })).toBeUndefined();
  });

  it('should say nothing while the agency address is not set', () => {
    vi.stubEnv('AGENCY_SERVER_URL', '');

    expect(getRequestWorkspace({ headers: { origin: 'https://admin.agency.test' } })).toBeUndefined();
  });
});

describe('URLs and name of a workspace', () => {
  beforeEach(() => {
    vi.stubEnv('SERVER_URL', 'https://portfolio.test');
    vi.stubEnv('WEBSITE_URL', 'https://www.portfolio.test');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  describe('when the agency variables are set', () => {
    beforeEach(() => {
      vi.stubEnv('AGENCY_SERVER_URL', 'https://admin.agency.test');
      vi.stubEnv('AGENCY_WEBSITE_URL', 'https://www.agency.test');
      vi.stubEnv('AGENCY_APP_NAME', 'Agency');
    });

    it('should give the agency values to the agency workspace', () => {
      expect(getServerUrl(TargetEnum.AGENCY)).toBe('https://admin.agency.test');
      expect(getClientUrl(TargetEnum.AGENCY)).toBe('https://www.agency.test');
      expect(getAppName(TargetEnum.AGENCY)).toBe('Agency');
    });

    it('should keep the portfolio values for the portfolio workspace and for no workspace', () => {
      expect(getServerUrl(TargetEnum.PORTFOLIO)).toBe('https://portfolio.test');
      expect(getServerUrl()).toBe('https://portfolio.test');
      expect(getClientUrl()).toBe('https://www.portfolio.test');
      expect(getAppName()).toBe(APP_NAME);
    });
  });

  describe('when the agency variables are not set', () => {
    // a developer's .env.local may define them: the test must not depend on the machine
    beforeEach(() => {
      vi.stubEnv('AGENCY_SERVER_URL', '');
      vi.stubEnv('AGENCY_WEBSITE_URL', '');
      vi.stubEnv('AGENCY_APP_NAME', '');
    });

    it('should fall back to the portfolio values for the agency workspace', () => {
      expect(getServerUrl(TargetEnum.AGENCY)).toBe('https://portfolio.test');
      expect(getClientUrl(TargetEnum.AGENCY)).toBe('https://www.portfolio.test');
      expect(getAppName(TargetEnum.AGENCY)).toBe(APP_NAME);
    });
  });
});

describe('e-mail account of a workspace', () => {
  beforeEach(() => {
    vi.stubEnv('BREVO_API_KEY', 'portfolio-key');
    vi.stubEnv('ADMIN_EMAIL_SENDER', 'hello@portfolio.test');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  describe('when the agency account is set', () => {
    beforeEach(() => {
      vi.stubEnv('AGENCY_BREVO_API_KEY', 'agency-key');
      vi.stubEnv('AGENCY_ADMIN_EMAIL_SENDER', 'hello@agency.test');
    });

    it('should give the agency key and sender to the agency workspace', () => {
      expect(getBrevoApiKey(TargetEnum.AGENCY)).toBe('agency-key');
      expect(getAdminEmailSender(TargetEnum.AGENCY)).toBe('hello@agency.test');
    });

    it('should keep the portfolio key and sender for the portfolio workspace and for no workspace', () => {
      expect(getBrevoApiKey(TargetEnum.PORTFOLIO)).toBe('portfolio-key');
      expect(getBrevoApiKey()).toBe('portfolio-key');
      expect(getAdminEmailSender(TargetEnum.PORTFOLIO)).toBe('hello@portfolio.test');
      expect(getAdminEmailSender()).toBe('hello@portfolio.test');
    });
  });

  describe('when the agency account is not set', () => {
    it('should fall back to the portfolio key and sender for the agency workspace', () => {
      expect(getBrevoApiKey(TargetEnum.AGENCY)).toBe('portfolio-key');
      expect(getAdminEmailSender(TargetEnum.AGENCY)).toBe('hello@portfolio.test');
    });

    it('should treat a variable left empty as not set', () => {
      vi.stubEnv('AGENCY_BREVO_API_KEY', '');
      vi.stubEnv('AGENCY_ADMIN_EMAIL_SENDER', '');

      expect(getBrevoApiKey(TargetEnum.AGENCY)).toBe('portfolio-key');
      expect(getAdminEmailSender(TargetEnum.AGENCY)).toBe('hello@portfolio.test');
    });
  });
});
