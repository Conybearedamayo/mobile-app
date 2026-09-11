import crypto from 'crypto';

const ENCRYPTION_SECRET = process.env.JWT_SECRET || 'jucoch_secret_key_2026';
// Derive a secure 32-byte key from the secret using scrypt
const KEY = crypto.scryptSync(ENCRYPTION_SECRET, 'jucoch_salt_vault_2026', 32);
const ALGORITHM = 'aes-256-cbc';
const PREFIX = 'enc:';

/**
 * Encrypt sensitive plain text using AES-256-CBC
 * Stores in format: "enc:<iv_hex>:<ciphertext_hex>"
 */
export const encryptSensitiveText = (text: string | null | undefined): string | null => {
  if (!text || !text.trim()) return text || null;
  // Avoid double encryption if already prefixed
  if (text.startsWith(PREFIX)) return text;
  try {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(ALGORITHM, KEY, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return `${PREFIX}${iv.toString('hex')}:${encrypted}`;
  } catch (error) {
    console.error('Encryption error:', error);
    return text;
  }
};

/**
 * Decrypt ciphertext back to original plain text
 * Supports backward compatibility for older unencrypted plain text entries
 */
export const decryptSensitiveText = (encryptedText: string | null | undefined): string => {
  if (!encryptedText) return '';
  // If not encrypted with our prefix, return as-is (backward compatible)
  if (!encryptedText.startsWith(PREFIX)) return encryptedText;
  try {
    const parts = encryptedText.slice(PREFIX.length).split(':');
    if (parts.length !== 2) return encryptedText;
    const iv = Buffer.from(parts[0], 'hex');
    const encrypted = parts[1];
    const decipher = crypto.createDecipheriv(ALGORITHM, KEY, iv);
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (error) {
    console.error('Decryption error:', error);
    return encryptedText;
  }
};
