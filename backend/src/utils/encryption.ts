import crypto from "crypto";
import dotenv from "dotenv";
import path from "path";

// Load environment variables from .env file (in project root)
const envPath = path.resolve(__dirname, "../../../.env");
dotenv.config({ path: envPath });

// Constants for encryption
const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 16; // For AES, this is always 16 bytes
const SALT_LENGTH = 64;
const TAG_LENGTH = 16;
const KEY_LENGTH = 32;

// Helper functions to get current config (dynamic, not cached)
const getEncryptionKey = (): string | undefined => {
  return process.env.ENCRYPTION_KEY;
};

const isEncryptionEnabledConfig = (): boolean => {
  return process.env.ENCRYPTION_ENABLED !== "false";
};

// Log warning if key is not configured
let keyWarningLogged = false;
const logKeyWarning = () => {
  if (!keyWarningLogged && !getEncryptionKey() && isEncryptionEnabledConfig()) {
    console.warn(
      "WARNING: ENCRYPTION_KEY not found in environment variables. Encryption will not work properly.",
    );
    keyWarningLogged = true;
  }
};

/**
 * Derives a key from the password using PBKDF2
 */
const deriveKey = (password: string, salt: Buffer): Buffer => {
  return crypto.pbkdf2Sync(password, salt, 100000, KEY_LENGTH, "sha256");
};

/**
 * Encrypts a string value using AES-256-GCM encryption
 * @param value - The string to encrypt
 * @returns Encrypted string (base64) or original value if encryption is disabled
 */
export const encryptValue = (value: string | null | undefined): string => {
  const key = getEncryptionKey();
  const enabled = isEncryptionEnabledConfig();

  if (!value || !enabled || !key) {
    logKeyWarning();
    return value || "";
  }

  try {
    // Generate random IV and salt
    const iv = crypto.randomBytes(IV_LENGTH);
    const salt = crypto.randomBytes(SALT_LENGTH);

    // Derive key from password
    const derivedKey = deriveKey(key, salt);

    // Create cipher
    const cipher = crypto.createCipheriv(ALGORITHM, derivedKey, iv);

    // Encrypt the value
    let encrypted = cipher.update(value, "utf8", "hex");
    encrypted += cipher.final("hex");

    // Get the auth tag
    const tag = cipher.getAuthTag();

    // Combine salt, iv, tag, and encrypted data
    const result = Buffer.concat([
      salt,
      iv,
      tag,
      Buffer.from(encrypted, "hex"),
    ]);

    // Return as base64
    return result.toString("base64");
  } catch (error) {
    console.error("Encryption error:", error);
    throw new Error("Failed to encrypt value");
  }
};

/**
 * Decrypts a string value using AES-256-GCM decryption
 * @param encryptedValue - The encrypted string to decrypt
 * @returns Decrypted string or original value if decryption fails
 */
export const decryptValue = (
  encryptedValue: string | null | undefined,
): string => {
  const key = getEncryptionKey();
  const enabled = isEncryptionEnabledConfig();

  if (!encryptedValue || !enabled || !key) {
    return encryptedValue || "";
  }

  try {
    // Decode from base64
    const buffer = Buffer.from(encryptedValue, "base64");

    // Extract salt, iv, tag, and encrypted data
    const salt = buffer.subarray(0, SALT_LENGTH);
    const iv = buffer.subarray(SALT_LENGTH, SALT_LENGTH + IV_LENGTH);
    const tag = buffer.subarray(
      SALT_LENGTH + IV_LENGTH,
      SALT_LENGTH + IV_LENGTH + TAG_LENGTH,
    );
    const encrypted = buffer.subarray(SALT_LENGTH + IV_LENGTH + TAG_LENGTH);

    // Derive key from password
    const derivedKey = deriveKey(key, salt);

    // Create decipher
    const decipher = crypto.createDecipheriv(ALGORITHM, derivedKey, iv);
    decipher.setAuthTag(tag);

    // Decrypt the value
    let decrypted = decipher.update(encrypted.toString("hex"), "hex", "utf8");
    decrypted += decipher.final("utf8");

    return decrypted;
  } catch (error) {
    console.error("Decryption error:", error);
    // Return original value if decryption fails (for backward compatibility)
    return encryptedValue;
  }
};

/**
 * Encrypts an object by encrypting specified fields
 * @param obj - The object to encrypt
 * @param fieldsToEncrypt - Array of field names to encrypt
 * @returns New object with encrypted fields
 */
export const encryptObject = <T extends Record<string, unknown>>(
  obj: T,
  fieldsToEncrypt: (keyof T)[],
): T => {
  if (!isEncryptionEnabledConfig()) {
    return obj;
  }

  const encrypted = { ...obj };

  for (const field of fieldsToEncrypt) {
    if (field in encrypted && encrypted[field]) {
      const value = encrypted[field];
      if (typeof value === "string") {
        encrypted[field] = encryptValue(value) as T[keyof T];
      } else if (typeof value === "object") {
        encrypted[field] = encryptValue(JSON.stringify(value)) as T[keyof T];
      }
    }
  }

  return encrypted;
};

/**
 * Decrypts an object by decrypting specified fields
 * @param obj - The object to decrypt
 * @param fieldsToDecrypt - Array of field names to decrypt
 * @returns New object with decrypted fields
 */
export const decryptObject = <T extends Record<string, unknown>>(
  obj: T,
  fieldsToDecrypt: (keyof T)[],
): T => {
  if (!isEncryptionEnabledConfig()) {
    return obj;
  }

  const decrypted = { ...obj };

  for (const field of fieldsToDecrypt) {
    if (field in decrypted && decrypted[field]) {
      const value = decrypted[field];
      if (typeof value === "string") {
        try {
          const decryptedValue = decryptValue(value);
          // Try to parse as JSON if it looks like JSON
          if (
            decryptedValue.startsWith("{") ||
            decryptedValue.startsWith("[")
          ) {
            decrypted[field] = JSON.parse(decryptedValue) as T[keyof T];
          } else {
            decrypted[field] = decryptedValue as T[keyof T];
          }
        } catch {
          // If decryption fails, keep original value
          decrypted[field] = value;
        }
      }
    }
  }

  return decrypted;
};

/**
 * Check if encryption is enabled
 */
export const isEncryptionEnabled = (): boolean => {
  return isEncryptionEnabledConfig();
};

/**
 * Get encryption status for logging/debugging
 */
export const getEncryptionStatus = () => {
  const key = getEncryptionKey();
  return {
    enabled: isEncryptionEnabledConfig(),
    keyConfigured: !!key,
    keyLength: key?.length || 0,
  };
};
