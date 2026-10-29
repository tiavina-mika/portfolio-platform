import crypto from 'crypto';

const ALGO = 'aes-256-ctr';

const errorMessage = 'No encryption keys defined';

/**
 * fixed key with dynamic key (id)
 * or one static key
 *@param {} id
 * @returns
 */
const getKey = (id?: string | null): string => {
  return id
    ? process.env.CRYPTO_FIXED_PART_KEY + id
    : process.env.CRYPTO_FIXED_FULL_KEY!;
};

/**
 * encrypt a text
 * by a static key or dynamic key
 * @param text
 * @param id
 * @param withSpecialCharacters
 * @returns
 */
export const encrypt = (text: string, id?: string | null, withSpecialCharacters = true): string | void => {
  if (
    !process.env.CRYPTO_IV ||
    !process.env.CRYPTO_FIXED_FULL_KEY ||
    !process.env.CRYPTO_FIXED_PART_KEY
  ) {
    throw new Error(errorMessage);
  }

  const ENC = getKey(id);
  const encryptionType = withSpecialCharacters ? 'base64' : 'hex';
  const cipher = crypto.createCipheriv(ALGO, ENC, process.env.CRYPTO_IV);
  let encrypted = cipher.update(text.trim(), 'utf8', encryptionType);

  encrypted += cipher.final(encryptionType);
  return encrypted;
};

export const decrypt = (text: string, id?: string | null, withSpecialCharacters = true): string | void => {
  if (
    !process.env.CRYPTO_IV ||
    !process.env.CRYPTO_FIXED_FULL_KEY ||
    !process.env.CRYPTO_FIXED_PART_KEY
  ) {
    throw new Error(errorMessage);
  }

  const ENC = getKey(id);
  const encryptionType = withSpecialCharacters ? 'base64' : 'hex';

  const decipher = crypto.createDecipheriv(ALGO, ENC, process.env.CRYPTO_IV);
  const decrypted = decipher.update(text, encryptionType, 'utf8');

  return decrypted + decipher.final('utf8');
};
