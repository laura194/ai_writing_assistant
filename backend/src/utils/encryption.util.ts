import CryptoJS from 'crypto-js';

/**
 * Simple application-level encryption utility
 * Encrypts sensitive data before storing in MongoDB
 */

// Get encryption key from environment
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || '';

if (!ENCRYPTION_KEY) {
  console.warn('⚠️  WARNING: ENCRYPTION_KEY not set in .env file!');
  console.warn('Data will not be encrypted. Run: npm run generate-encryption-key');
}

/**
 * Encrypt a string value
 * @param plaintext - The text to encrypt
 * @returns Encrypted string (base64)
 */
export function encrypt(plaintext: string): string {
  if (!ENCRYPTION_KEY) {
    console.warn('⚠️  Encryption skipped: ENCRYPTION_KEY not configured');
    return plaintext;
  }

  if (!plaintext) {
    return plaintext;
  }

  try {
    const encrypted = CryptoJS.AES.encrypt(plaintext, ENCRYPTION_KEY).toString();
    return encrypted;
  } catch (error) {
    console.error('❌ Encryption error:', error);
    throw new Error('Failed to encrypt data');
  }
}

/**
 * Decrypt an encrypted string
 * @param ciphertext - The encrypted text (base64)
 * @returns Decrypted plaintext string
 */
export function decrypt(ciphertext: string): string {
  if (!ENCRYPTION_KEY) {
    console.warn('⚠️  Decryption skipped: ENCRYPTION_KEY not configured');
    return ciphertext;
  }

  if (!ciphertext) {
    return ciphertext;
  }

  try {
    const decrypted = CryptoJS.AES.decrypt(ciphertext, ENCRYPTION_KEY);
    const plaintext = decrypted.toString(CryptoJS.enc.Utf8);
    
    if (!plaintext) {
      throw new Error('Decryption resulted in empty string');
    }
    
    return plaintext;
  } catch (error) {
    console.error('❌ Decryption error:', error);
    throw new Error('Failed to decrypt data');
  }
}

/**
 * Check if encryption is properly configured
 */
export function isEncryptionEnabled(): boolean {
  return ENCRYPTION_KEY.length > 0;
}
