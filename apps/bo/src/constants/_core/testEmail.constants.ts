import { LANGUAGE_CODES } from '@shared/constants';

export const TEST_EMAIL_TEMPLATES = [
  'sendVerificationCodeTest',
  'sendResetPasswordVerificationCodeTest',
  'sendArticleToNewsletterTest',
  'sendInvitationTest',
  'sendWelcomeEmailTest',
] as const;

export const TEST_EMAIL_LOCALES = LANGUAGE_CODES;
