// Import here your languages
import en from './locales/en';
import fr from './locales/fr';
import mg from './locales/mg';

// Export here your language files import
export const resources = {
  en,
  fr,
  mg,
};

export const NS = Object.keys(en);
export const defaultNS = 'common';
