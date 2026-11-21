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

export const QUOTE_FORM_RECAPTCHA_ACTION = 'contactForm';
