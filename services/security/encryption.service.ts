import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;

let hasWarnedMissingKey = false;
const LEGACY_DEV_FALLBACK = 'blogflow-ai-master-secret-encryption-key-32bytes!';

/**
 * Returns a 32-byte Buffer key derived from the ENCRYPTION_KEY environment variable.
 * Falls back to NEXTAUTH_SECRET derivation in development with a single warning.
 */
function getEncryptionKey(): Buffer {
  const configured = process.env.ENCRYPTION_KEY?.trim();
  if (configured) {
    return crypto.createHash('sha256').update(configured).digest();
  }

  if (!hasWarnedMissingKey) {
    hasWarnedMissingKey = true;
    console.warn(
      '[Security Warning] ENCRYPTION_KEY is not set. Deriving key from NEXTAUTH_SECRET environment context.'
    );
  }

  const envFallback =
    process.env.NEXTAUTH_SECRET?.trim() ||
    process.env.DATABASE_URL?.trim() ||
    LEGACY_DEV_FALLBACK;

  return crypto.createHash('sha256').update(`blogflow-cms-key:${envFallback}`).digest();
}

function decryptWithKey(
  iv: Buffer,
  authTag: Buffer,
  encryptedHex: string,
  key: Buffer
): string {
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);
  let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

/**
 * Encrypts a plaintext string (e.g. WordPress application password) using AES-256-GCM.
 * Output format: iv:authTag:ciphertext (hex-encoded)
 */
export function encryptCredential(plainText: string): string {
  if (!plainText) return '';
  const iv = crypto.randomBytes(IV_LENGTH);
  const key = getEncryptionKey();
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  let encrypted = cipher.update(plainText, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag().toString('hex');

  return `${iv.toString('hex')}:${authTag}:${encrypted}`;
}

/**
 * Decrypts an encrypted credential string using AES-256-GCM.
 */
export function decryptCredential(cipherPackage: string): string {
  if (!cipherPackage) return '';
  const parts = cipherPackage.split(':');
  if (parts.length !== 3) {
    throw new Error('Invalid cipher package format. Expected iv:authTag:ciphertext');
  }

  const [ivHex, authTagHex, encryptedHex] = parts;
  const iv = Buffer.from(ivHex, 'hex');
  const authTag = Buffer.from(authTagHex, 'hex');
  const primaryKey = getEncryptionKey();

  try {
    return decryptWithKey(iv, authTag, encryptedHex, primaryKey);
  } catch {
    // Support decrypting existing seeded records encrypted with the legacy key
    const legacyKey = crypto.createHash('sha256').update(LEGACY_DEV_FALLBACK).digest();
    return decryptWithKey(iv, authTag, encryptedHex, legacyKey);
  }
}

/**
 * Masks credentials for safe logging or debug display.
 * E.g., 'xxxx-xxxx-xxxx-xxxx' -> 'xxxx...xxxx'
 */
export function maskSecret(secret: string): string {
  if (!secret || secret.length < 6) return '******';
  return `${secret.slice(0, 4)}...${secret.slice(-4)}`;
}
