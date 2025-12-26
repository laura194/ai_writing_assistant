import { describe, it, expect, beforeEach, beforeAll, afterEach } from "vitest";
import dotenv from "dotenv";
import path from "path";
import crypto from "crypto";

// Load environment variables from project root before importing encryption module
dotenv.config({ path: path.resolve(__dirname, "../../../.env") });

import {
  encryptValue,
  decryptValue,
  encryptObject,
  decryptObject,
  isEncryptionEnabled,
  getEncryptionStatus,
} from "./encryption";

/**
 * Generate a secure test encryption key
 * Uses Node.js crypto to generate a random 256-bit key
 */
const generateTestEncryptionKey = (): string => {
  return crypto.randomBytes(32).toString("hex");
};

describe("Encryption Utility (Node.js crypto)", () => {
  let testEncryptionKey: string;
  let originalEncryptionKey: string | undefined;
  let originalEncryptionEnabled: string | undefined;

  beforeAll(() => {
    // Save original environment variables
    originalEncryptionKey = process.env.ENCRYPTION_KEY;
    originalEncryptionEnabled = process.env.ENCRYPTION_ENABLED;

    // Generate a unique test key for this test suite
    testEncryptionKey = generateTestEncryptionKey();

    // Set test environment variables
    process.env.ENCRYPTION_KEY = testEncryptionKey;
    process.env.ENCRYPTION_ENABLED = "true";
  });

  afterEach(() => {
    // Reset to default enabled state after each test
    process.env.ENCRYPTION_ENABLED = "true";
    process.env.ENCRYPTION_KEY = testEncryptionKey;
  });

  describe("encryptValue and decryptValue", () => {
    it("should encrypt and decrypt a string value", () => {
      const originalValue = "Hello, World!";
      const encrypted = encryptValue(originalValue);

      expect(encrypted).not.toBe(originalValue);
      expect(encrypted.length).toBeGreaterThan(0);

      const decrypted = decryptValue(encrypted);
      expect(decrypted).toBe(originalValue);
    });

    it("should produce different encrypted values for the same input (random IV)", () => {
      const value = "Test Value";
      const encrypted1 = encryptValue(value);
      const encrypted2 = encryptValue(value);

      // Should produce different encrypted strings due to random IV and salt
      expect(encrypted1).not.toBe(encrypted2);

      // But both should decrypt to the same value
      expect(decryptValue(encrypted1)).toBe(value);
      expect(decryptValue(encrypted2)).toBe(value);
    });

    it("should handle empty strings", () => {
      const encrypted = encryptValue("");
      expect(encrypted).toBe("");
    });

    it("should handle null values", () => {
      const encrypted = encryptValue(null);
      expect(encrypted).toBe("");
    });

    it("should handle undefined values", () => {
      const encrypted = encryptValue(undefined);
      expect(encrypted).toBe("");
    });

    it("should encrypt special characters", () => {
      const originalValue = "!@#$%^&*()_+-=[]{}|;:',.<>?/`~";
      const encrypted = encryptValue(originalValue);
      const decrypted = decryptValue(encrypted);
      expect(decrypted).toBe(originalValue);
    });

    it("should encrypt unicode and emoji characters", () => {
      const originalValue = "Hello 世界 🌍 🚀 café";
      const encrypted = encryptValue(originalValue);
      const decrypted = decryptValue(encrypted);
      expect(decrypted).toBe(originalValue);
    });

    it("should encrypt long strings", () => {
      const originalValue = "a".repeat(10000);
      const encrypted = encryptValue(originalValue);
      const decrypted = decryptValue(encrypted);
      expect(decrypted).toBe(originalValue);
      expect(encrypted.length).toBeGreaterThan(originalValue.length);
    });

    it("should encrypt multiline strings", () => {
      const originalValue = "Line 1\nLine 2\nLine 3\r\nLine 4";
      const encrypted = encryptValue(originalValue);
      const decrypted = decryptValue(encrypted);
      expect(decrypted).toBe(originalValue);
    });

    it("should encrypt JSON strings", () => {
      const originalValue = JSON.stringify({
        key: "value",
        nested: { data: 123 },
      });
      const encrypted = encryptValue(originalValue);
      const decrypted = decryptValue(encrypted);
      expect(decrypted).toBe(originalValue);
      expect(JSON.parse(decrypted)).toEqual({
        key: "value",
        nested: { data: 123 },
      });
    });

    it("should return original value when encryption is disabled", () => {
      process.env.ENCRYPTION_ENABLED = "false";
      const value = "test value";
      const encrypted = encryptValue(value);
      expect(encrypted).toBe(value);
    });

    it("should return original value when key is missing", () => {
      delete process.env.ENCRYPTION_KEY;
      const value = "test value";
      const encrypted = encryptValue(value);
      expect(encrypted).toBe(value);
    });

    it("should handle decryption with encryption disabled", () => {
      process.env.ENCRYPTION_ENABLED = "false";
      const value = "test value";
      const decrypted = decryptValue(value);
      expect(decrypted).toBe(value);
    });

    it("should handle decryption with missing key", () => {
      delete process.env.ENCRYPTION_KEY;
      const value = "test value";
      const decrypted = decryptValue(value);
      expect(decrypted).toBe(value);
    });

    it("should return original value for invalid encrypted data", () => {
      const invalidEncrypted = "invalid-base64-!@#$%";
      const result = decryptValue(invalidEncrypted);
      expect(result).toBe(invalidEncrypted);
    });

    it("should handle tampered encrypted data gracefully", () => {
      const originalValue = "Hello, World!";
      const encrypted = encryptValue(originalValue);

      // Tamper with the encrypted data
      const tamperedEncrypted = encrypted.slice(0, -5) + "XXXXX";

      // Should not throw, but return the tampered value
      const result = decryptValue(tamperedEncrypted);
      expect(result).toBe(tamperedEncrypted);
    });

    it("should not decrypt with wrong key", () => {
      const originalValue = "Secret Message";
      const encrypted = encryptValue(originalValue);

      // Change the key
      process.env.ENCRYPTION_KEY = generateTestEncryptionKey();

      // Should fail to decrypt and return the encrypted value
      const result = decryptValue(encrypted);
      expect(result).not.toBe(originalValue);
      expect(result).toBe(encrypted);
    });
  });

  describe("encryptObject and decryptObject", () => {
    it("should encrypt specified fields in an object", () => {
      const obj = {
        name: "John Doe",
        email: "john@example.com",
        age: 30,
      };

      const encrypted = encryptObject(obj, ["name", "email"]);

      expect(encrypted.name).not.toBe(obj.name);
      expect(encrypted.email).not.toBe(obj.email);
      expect(encrypted.age).toBe(obj.age); // age should not be encrypted
      expect(typeof encrypted.name).toBe("string");
      expect(typeof encrypted.email).toBe("string");
    });

    it("should decrypt specified fields in an object", () => {
      const obj = {
        name: "John Doe",
        email: "john@example.com",
        age: 30,
      };

      const encrypted = encryptObject(obj, ["name", "email"]);
      const decrypted = decryptObject(encrypted, ["name", "email"]);

      expect(decrypted.name).toBe(obj.name);
      expect(decrypted.email).toBe(obj.email);
      expect(decrypted.age).toBe(obj.age);
    });

    it("should handle objects with nested structures", () => {
      const obj = {
        content: JSON.stringify({ nested: "data", value: 123 }),
        title: "Test",
      };

      const encrypted = encryptObject(obj, ["content"]);
      expect(encrypted.content).not.toBe(obj.content);

      const decrypted = decryptObject(encrypted, ["content"]);
      // decryptObject automatically parses JSON
      expect(decrypted.content).toEqual({ nested: "data", value: 123 });
    });

    it("should handle object values directly", () => {
      const obj = {
        metadata: { userId: 123, role: "admin" },
        title: "Test",
      };

      const encrypted = encryptObject(obj, ["metadata"]);
      expect(typeof encrypted.metadata).toBe("string");

      const decrypted = decryptObject(encrypted, ["metadata"]);
      expect(decrypted.metadata).toEqual({ userId: 123, role: "admin" });
    });

    it("should handle empty objects", () => {
      const obj = {};
      const encrypted = encryptObject(obj, []);
      expect(encrypted).toEqual({});
    });

    it("should skip null or undefined fields", () => {
      const obj = {
        name: "John",
        email: null as any,
        phone: undefined as any,
      };

      const encrypted = encryptObject(obj, ["name", "email", "phone"]);
      expect(encrypted.name).not.toBe(obj.name);
      expect(encrypted.email).toBeNull();
      expect(encrypted.phone).toBeUndefined();
    });

    it("should handle objects with only encrypted fields", () => {
      const obj = {
        secret1: "value1",
        secret2: "value2",
      };

      const encrypted = encryptObject(obj, ["secret1", "secret2"]);
      expect(encrypted.secret1).not.toBe(obj.secret1);
      expect(encrypted.secret2).not.toBe(obj.secret2);

      const decrypted = decryptObject(encrypted, ["secret1", "secret2"]);
      expect(decrypted).toEqual(obj);
    });

    it("should not encrypt fields not in the list", () => {
      const obj = {
        public: "visible",
        private: "secret",
      };

      const encrypted = encryptObject(obj, ["private"]);
      expect(encrypted.public).toBe(obj.public);
      expect(encrypted.private).not.toBe(obj.private);
    });

    it("should handle decryption of non-JSON strings", () => {
      const obj = {
        description: "Just a plain string",
        id: 123,
      };

      const encrypted = encryptObject(obj, ["description"]);
      const decrypted = decryptObject(encrypted, ["description"]);

      expect(decrypted.description).toBe(obj.description);
      expect(typeof decrypted.description).toBe("string");
    });

    it("should preserve original value if decryption fails", () => {
      const obj = {
        name: "John",
        corrupted: "invalid-encrypted-data",
      };

      const decrypted = decryptObject(obj, ["corrupted"]);
      expect(decrypted.corrupted).toBe("invalid-encrypted-data");
    });

    it("should return original object when encryption is disabled", () => {
      process.env.ENCRYPTION_ENABLED = "false";

      const obj = {
        name: "John Doe",
        email: "john@example.com",
      };

      const encrypted = encryptObject(obj, ["name", "email"]);
      expect(encrypted).toEqual(obj);
      expect(encrypted).toBe(obj); // Should be same reference
    });
  });

  describe("isEncryptionEnabled", () => {
    it("should return true when encryption is enabled", () => {
      process.env.ENCRYPTION_ENABLED = "true";
      expect(isEncryptionEnabled()).toBe(true);
    });

    it("should return false when encryption is explicitly disabled", () => {
      process.env.ENCRYPTION_ENABLED = "false";
      expect(isEncryptionEnabled()).toBe(false);
    });

    it("should return true when ENCRYPTION_ENABLED is not set (default)", () => {
      delete process.env.ENCRYPTION_ENABLED;
      expect(isEncryptionEnabled()).toBe(true);
    });

    it("should return true for any value other than 'false'", () => {
      process.env.ENCRYPTION_ENABLED = "0";
      expect(isEncryptionEnabled()).toBe(true);

      process.env.ENCRYPTION_ENABLED = "no";
      expect(isEncryptionEnabled()).toBe(true);
    });
  });

  describe("getEncryptionStatus", () => {
    it("should return encryption status object with all properties", () => {
      process.env.ENCRYPTION_ENABLED = "true";
      const status = getEncryptionStatus();

      expect(status).toHaveProperty("enabled");
      expect(status).toHaveProperty("keyConfigured");
      expect(status).toHaveProperty("keyLength");
      expect(typeof status.enabled).toBe("boolean");
      expect(typeof status.keyConfigured).toBe("boolean");
      expect(typeof status.keyLength).toBe("number");
    });

    it("should show key as configured when present", () => {
      process.env.ENCRYPTION_KEY = testEncryptionKey;
      const status = getEncryptionStatus();

      expect(status.keyConfigured).toBe(true);
      expect(status.keyLength).toBeGreaterThan(0);
      expect(status.keyLength).toBe(testEncryptionKey.length);
    });

    it("should show key as not configured when missing", () => {
      delete process.env.ENCRYPTION_KEY;
      const status = getEncryptionStatus();

      expect(status.keyConfigured).toBe(false);
      expect(status.keyLength).toBe(0);
    });

    it("should reflect enabled/disabled state", () => {
      process.env.ENCRYPTION_ENABLED = "true";
      let status = getEncryptionStatus();
      expect(status.enabled).toBe(true);

      process.env.ENCRYPTION_ENABLED = "false";
      status = getEncryptionStatus();
      expect(status.enabled).toBe(false);
    });
  });

  describe("Edge cases and security", () => {
    it("should handle very large objects", () => {
      const largeObj = {
        data: "x".repeat(100000),
        metadata: { count: 1000 },
      };

      const encrypted = encryptObject(largeObj, ["data"]);
      const decrypted = decryptObject(encrypted, ["data"]);

      expect(decrypted.data).toBe(largeObj.data);
    });

    it("should handle arrays in objects", () => {
      const obj = {
        tags: ["tag1", "tag2", "tag3"],
        id: 123,
      };

      const encrypted = encryptObject(obj, ["tags"]);
      const decrypted = decryptObject(encrypted, ["tags"]);

      expect(decrypted.tags).toEqual(["tag1", "tag2", "tag3"]);
    });

    it("should handle deeply nested objects", () => {
      const obj = {
        data: {
          level1: {
            level2: {
              level3: "deep value",
            },
          },
        },
      };

      const encrypted = encryptObject(obj, ["data"]);
      const decrypted = decryptObject(encrypted, ["data"]);

      expect(decrypted.data).toEqual(obj.data);
    });

    it("should produce different results for same data encrypted multiple times", () => {
      const value = "Test Data";
      const encrypted1 = encryptValue(value);
      const encrypted2 = encryptValue(value);
      const encrypted3 = encryptValue(value);

      // All should be different (due to random IV and salt)
      expect(encrypted1).not.toBe(encrypted2);
      expect(encrypted2).not.toBe(encrypted3);
      expect(encrypted1).not.toBe(encrypted3);

      // But all should decrypt correctly
      expect(decryptValue(encrypted1)).toBe(value);
      expect(decryptValue(encrypted2)).toBe(value);
      expect(decryptValue(encrypted3)).toBe(value);
    });
  });
});
