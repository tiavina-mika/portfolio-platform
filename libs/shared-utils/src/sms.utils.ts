import {
  GSM_BASIC_CHARACTERS, GSM_EXTENSION_CHARACTERS, GSM_SAFE_REPLACEMENTS,
} from '@shared/constants';

const gsmBasic = new Set(GSM_BASIC_CHARACTERS);
const gsmExtension = new Set(GSM_EXTENSION_CHARACTERS);

const isGsmCharacter = (char: string): boolean => gsmBasic.has(char) || gsmExtension.has(char);

/**
 * Rewrites a text so that it only uses the standard SMS alphabet (GSM 7-bit).
 *
 * A single character outside that alphabet switches the whole SMS to Unicode, where a segment
 * holds 70 characters instead of 160 — the same message then costs the sender two or three times
 * as many SMS. Typographic marks get their plain equivalent (`→` → `-`, `’` → `'`), accented
 * letters the alphabet lacks lose their accent (`ê` → `e`), and whatever is left (emoji…) is
 * dropped. The accents the alphabet has (é, è, à, ù…) are kept.
 * @param text the message as written for a rich channel (WhatsApp, e-mail…)
 * @returns the same message, GSM 7-bit only
 */
export const toGsmSafeText = (text: string): string => Array.from(text).map((char) => {
  if (isGsmCharacter(char)) return char;

  const replacement = GSM_SAFE_REPLACEMENTS[char];

  if (replacement !== undefined) return replacement;

  // letter + combining accent: keep the bare letter when the alphabet has it
  const bare = char.normalize('NFD').replace(/[̀-ͯ]/g, '');

  return Array.from(bare).every(isGsmCharacter) ? bare : '';
}).join('');

/**
 * Length of a GSM 7-bit text in septets, the unit SMS segments are counted in: characters of the
 * extension table (`|`, `€`, `[`…) take two.
 */
export const getGsmSeptetCount = (text: string): number =>
  Array.from(text).reduce((total, char) => total + (gsmExtension.has(char) ? 2 : 1), 0);
