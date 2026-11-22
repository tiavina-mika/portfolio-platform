import { describe, expect, it } from 'vitest';

import {
  maskEmail, maskPhone, maskPhoneNumber, maskUsername,
} from './pii.utils';

describe('masking personal data shown to an admin', () => {
  describe('an email', () => {
    it('should keep the first two characters and the domain readable', () => {
      expect(maskEmail('john.doe@gmail.com')).toBe('jo******@gmail.com');
    });

    it('should mask at least one character of a very short local part', () => {
      expect(maskEmail('a@x.com')).toBe('a*@x.com');
    });

    it('should mask everything when the value has no @', () => {
      expect(maskEmail('john-doe')).toBe('********');
    });

    it('should return nothing for an empty value', () => {
      expect(maskEmail('')).toBeUndefined();
      expect(maskEmail(null)).toBeUndefined();
      expect(maskEmail(undefined)).toBeUndefined();
    });
  });

  describe('a phone number', () => {
    it('should keep only the last two digits', () => {
      expect(maskPhoneNumber('341234567')).toBe('*******67');
      expect(maskPhoneNumber(341234567)).toBe('*******67');
    });

    it('should leave a number of two digits or less unmasked', () => {
      expect(maskPhoneNumber('7')).toBe('7');
    });

    it('should return nothing for an empty value', () => {
      expect(maskPhoneNumber('')).toBeUndefined();
      expect(maskPhoneNumber(null)).toBeUndefined();
    });

    it('should keep the dial code of a phone and mask its number', () => {
      expect(maskPhone({ code: '261', number: '341234567' })).toEqual({ code: '261', number: '*******67' });
      expect(maskPhone(null)).toBeUndefined();
    });
  });

  describe('a username', () => {
    it('should be masked as an email when it is one', () => {
      expect(maskUsername('john.doe@gmail.com')).toBe('jo******@gmail.com');
    });

    it('should be masked as a phone number otherwise', () => {
      expect(maskUsername('+261341234567')).toBe('***********67');
    });
  });
});
