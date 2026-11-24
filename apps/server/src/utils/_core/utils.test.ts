import { TargetEnum } from '@shared/types';
import {
  afterEach, beforeEach, describe, expect, it, vi,
} from 'vitest';

import { getAppName, getClientUrl, getServerUrl } from './utils';
import { APP_NAME } from '../../constants/_core/constants';

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
    it('should fall back to the portfolio values for the agency workspace', () => {
      expect(getServerUrl(TargetEnum.AGENCY)).toBe('https://portfolio.test');
      expect(getClientUrl(TargetEnum.AGENCY)).toBe('https://www.portfolio.test');
      expect(getAppName(TargetEnum.AGENCY)).toBe(APP_NAME);
    });
  });
});
