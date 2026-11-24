import { TargetEnum } from '@shared/types';
import {
  afterEach, beforeEach, describe, expect, it, vi,
} from 'vitest';

import {
  getCloudinaryCallOptions, getCloudinaryName, getCloudinaryNames, getCloudinaryWorkspaces,
  getFileWorkspace,
} from './cloudinary.utils';

const PORTFOLIO_FILE = { publicId: 'a', url: 'https://res.cloudinary.com/portfolio-cloud/image/upload/v1/a.png' };
const AGENCY_FILE = { publicId: 'b', url: 'https://res.cloudinary.com/agency-cloud/image/upload/v1/b.png' };

describe('Cloudinary account of a workspace', () => {
  beforeEach(() => {
    vi.stubEnv('CLOUDINARY_NAME', 'portfolio-cloud');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  describe('when the agency has its own account', () => {
    beforeEach(() => {
      vi.stubEnv('AGENCY_CLOUDINARY_NAME', 'agency-cloud');
      vi.stubEnv('AGENCY_CLOUDINARY_API_KEY', 'agency-key');
      vi.stubEnv('AGENCY_CLOUDINARY_API_SECRET', 'agency-secret');
    });

    it('should give the agency account to the agency workspace only', () => {
      expect(getCloudinaryName(TargetEnum.AGENCY)).toBe('agency-cloud');
      expect(getCloudinaryName(TargetEnum.PORTFOLIO)).toBe('portfolio-cloud');
      expect(getCloudinaryName()).toBe('portfolio-cloud');
      expect(getCloudinaryCallOptions(TargetEnum.AGENCY)).toEqual({
        cloud_name: 'agency-cloud', api_key: 'agency-key', api_secret: 'agency-secret',
      });
      expect(getCloudinaryCallOptions(TargetEnum.PORTFOLIO)).toEqual({});
    });

    it('should read the account of a file from its address', () => {
      expect(getFileWorkspace(AGENCY_FILE)).toBe(TargetEnum.AGENCY);
      expect(getFileWorkspace(PORTFOLIO_FILE)).toBe(TargetEnum.PORTFOLIO);
    });

    it('should keep a file with no known address in the portfolio account', () => {
      expect(getFileWorkspace({ url: 'https://evil.example/agency-cloud/a.png' })).toBe(TargetEnum.PORTFOLIO);
      // a cloud whose name only starts like the agency's
      expect(getFileWorkspace({ url: 'https://res.cloudinary.com/agency-cloud-2/a.png' })).toBe(TargetEnum.PORTFOLIO);
      expect(getFileWorkspace({})).toBe(TargetEnum.PORTFOLIO);
      expect(getFileWorkspace(undefined)).toBe(TargetEnum.PORTFOLIO);
    });

    it('should list both accounts', () => {
      expect(getCloudinaryWorkspaces()).toEqual([TargetEnum.PORTFOLIO, TargetEnum.AGENCY]);
      expect(getCloudinaryNames()).toEqual(['portfolio-cloud', 'agency-cloud']);
    });
  });

  describe('when the agency has no account of its own', () => {
    it('should use the portfolio account for everything', () => {
      expect(getCloudinaryName(TargetEnum.AGENCY)).toBe('portfolio-cloud');
      expect(getCloudinaryCallOptions(TargetEnum.AGENCY)).toEqual({});
      expect(getFileWorkspace(AGENCY_FILE)).toBe(TargetEnum.PORTFOLIO);
      expect(getCloudinaryWorkspaces()).toEqual([TargetEnum.PORTFOLIO]);
      expect(getCloudinaryNames()).toEqual(['portfolio-cloud']);
    });

    it('should ignore an account that is only partly set', () => {
      vi.stubEnv('AGENCY_CLOUDINARY_NAME', 'agency-cloud');

      expect(getCloudinaryName(TargetEnum.AGENCY)).toBe('portfolio-cloud');
      expect(getCloudinaryCallOptions(TargetEnum.AGENCY)).toEqual({});
    });
  });
});
