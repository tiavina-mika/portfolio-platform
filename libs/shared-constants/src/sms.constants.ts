/**
 * The standard SMS alphabet (GSM 03.38 basic character set): every character that keeps an SMS in
 * 7-bit encoding, 160 characters per segment (153 once the message spans several).
 */
export const GSM_BASIC_CHARACTERS = [
  '@', '£', '$', '¥', 'è', 'é', 'ù', 'ì', 'ò', 'Ç', '\n', 'Ø', 'ø', '\r', 'Å', 'å',
  'Δ', '_', 'Φ', 'Γ', 'Λ', 'Ω', 'Π', 'Ψ', 'Σ', 'Θ', 'Ξ', 'Æ', 'æ', 'ß', 'É',
  ' ', '!', '"', '#', '¤', '%', '&', '\'', '(', ')', '*', '+', ',', '-', '.', '/',
  '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', ':', ';', '<', '=', '>', '?',
  '¡', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O',
  'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', 'Ä', 'Ö', 'Ñ', 'Ü', '§',
  '¿', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o',
  'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', 'ä', 'ö', 'ñ', 'ü', 'à',
];

/** Extension table of the SMS alphabet: still 7-bit, but each one takes two septets */
export const GSM_EXTENSION_CHARACTERS = ['\f', '^', '{', '}', '\\', '[', '~', ']', '|', '€'];

/**
 * Plain stand-ins for the typographic marks of the WhatsApp version of a message, so its SMS
 * version stays in the standard alphabet. Anything else outside it loses its accent or is dropped.
 */
export const GSM_SAFE_REPLACEMENTS: Record<string, string> = {
  '→': '-',
  '·': '|',
  '’': '\'',
  '‘': '\'',
  '“': '"',
  '”': '"',
  '«': '"',
  '»': '"',
  '–': '-',
  '—': '-',
  '…': '...',
  ' ': ' ',
  ' ': ' ',
};

/** Length of one segment of a multi-part SMS, in septets */
export const SMS_MULTIPART_SEGMENT_SEPTETS = 153;
