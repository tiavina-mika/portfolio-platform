/* eslint-disable @cspell/spellchecker */
import crypto from 'crypto';

const ALGO = 'aes-256-ctr';
const IV_LENGTH = 16;

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
 * a fresh random IV is generated on every call and prefixed (hex) to the ciphertext —
 * reusing a static IV with the same key would let an attacker XOR keystreams across messages
 * @param text
 * @param id
 * @param withSpecialCharacters
 * @returns
 */
export const encrypt = (text: string, id?: string | null, withSpecialCharacters = true): string | void => {
  if (!process.env.CRYPTO_FIXED_FULL_KEY || !process.env.CRYPTO_FIXED_PART_KEY) {
    throw new Error(errorMessage);
  }

  const ENC = getKey(id);
  const encryptionType = withSpecialCharacters ? 'base64' : 'hex';
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGO, ENC, iv);
  let encrypted = cipher.update(text.trim(), 'utf8', encryptionType);

  encrypted += cipher.final(encryptionType);
  return iv.toString('hex') + encrypted;
};

export const decrypt = (text: string, id?: string | null, withSpecialCharacters = true): string | void => {
  if (!process.env.CRYPTO_FIXED_FULL_KEY || !process.env.CRYPTO_FIXED_PART_KEY) {
    throw new Error(errorMessage);
  }

  const ENC = getKey(id);
  const encryptionType = withSpecialCharacters ? 'base64' : 'hex';
  const iv = Buffer.from(text.slice(0, IV_LENGTH * 2), 'hex');
  const cipherText = text.slice(IV_LENGTH * 2);

  const decipher = crypto.createDecipheriv(ALGO, ENC, iv);
  const decrypted = decipher.update(cipherText, encryptionType, 'utf8');

  return decrypted + decipher.final('utf8');
};

/**
 * One-way hash for single-use secrets (MFA backup codes, password-reset tokens) — these are only
 * ever compared, never decrypted back to plaintext, so a hash (not `encrypt`) is the right
 * primitive. Storing the hash means a database dump cannot be replayed against the endpoint that
 * consumes the secret.
 */
export const hashSingleUseToken = (value: string): string => {
  return crypto.createHash('sha256').update(value.trim()).digest('hex');
};

/**
 * A cryptographically random, URL-safe single-use token. Unlike `encrypt(...)`, two calls with
 * the same input never produce the same value and nothing else in the codebase can derive it —
 * which is what an authorization token has to guarantee.
 */
export const generateSingleUseToken = (): string => crypto.randomBytes(32).toString('hex');

const BACKUP_CODE_LABEL = 'mfa-backup-code';
const BACKUP_CODE_HASH_PREFIX = 'v2:';

/**
 * Keyed hash (HMAC with a key derived from the server's static key): a copy of the database alone
 * is of no use to test guesses against a backup code's ~49 bits.
 */
export const hashBackupCode = (code: string): string => BACKUP_CODE_HASH_PREFIX + crypto
  .createHmac('sha256', crypto.createHmac('sha256', process.env.CRYPTO_FIXED_FULL_KEY!)
    .update(BACKUP_CODE_LABEL).digest())
  .update(code.trim())
  .digest('hex');

const isSameHash = (left: string, right: string): boolean => (
  left.length === right.length && crypto.timingSafeEqual(Buffer.from(left), Buffer.from(right))
);

export const compareBackupCode = (code: string, hash: string): boolean => (
  hash.startsWith(BACKUP_CODE_HASH_PREFIX)
    ? isSameHash(hashBackupCode(code), hash)
    // codes issued before the keyed hash: still accepted until the admin regenerates them
    : isSameHash(hashSingleUseToken(code), hash)
);
