// the supports a visitor can ask a quote for, in the order the form lists them
export const QUOTE_SUPPORT_KEYS = ['web', 'app', 'mobile', 'bo'] as const;

// what the visitor already has when they come to us, in the order the form lists them
export const QUOTE_BRING_KEYS = ['idea', 'spec', 'mockup'] as const;

// the names of the choices in the message the team receives, in English whatever the visitor's language
export const QUOTE_SUPPORT_LABELS = {
  web: 'Static website',
  app: 'Web app',
  mobile: 'Mobile app',
  bo: 'Back office',
} as const;

export const QUOTE_BRING_LABELS = {
  idea: 'An idea',
  spec: 'A specification',
  mockup: 'A mockup',
} as const;

export const QUOTE_FIELD_MAX_LENGTHS = {
  name: 120,
  email: 120,
  product: 300,
  needs: 300,
  estimate: 400,
} as const;

export const QUOTE_NAME_MIN_LENGTH = 2;
export const QUOTE_PRODUCT_MIN_LENGTH = 5;

// attachments: Word, PDF and images, ten of them at most, 10 MB each
export const QUOTE_ALLOWED_FILE_EXTENSIONS = [
  'pdf', 'doc', 'docx', 'png', 'jpg', 'jpeg', 'gif', 'webp', 'heic',
] as const;
export const QUOTE_FILE_ACCEPT = [
  ...QUOTE_ALLOWED_FILE_EXTENSIONS.map(extension => `.${extension}`),
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'image/*',
].join(',');
export const QUOTE_MAX_FILE_SIZE = 10 * 1024 * 1024;
export const QUOTE_MAX_FILES = 10;
// the longest list of file names written in the message: the names are only a hint for the team
export const QUOTE_FILE_NAMES_MAX_LENGTH = 150;

export const QUOTE_FORM_RECAPTCHA_ACTION = 'contactForm';
