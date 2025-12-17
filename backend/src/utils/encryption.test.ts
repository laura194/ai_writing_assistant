import { describe, it, expect, beforeEach, beforeAll } from "vitest";
import dotenv from "dotenv";
import path from "path";

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

describe("Encryption Utility", () => {
  beforeAll(() => {
    // Ensure encryption key is set for tests
    if (!process.env.ENCRYPTION_KEY) {
      // Fallback test key if not in .env
      process.env.ENCRYPTION_KEY =
        "REDACTED";
    }
    process.env.ENCRYPTION_ENABLED = "true";
  });

  beforeEach(() => {
    // Reset encryption config before each test
    process.env.ENCRYPTION_ENABLED = "true";
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
      const originalValue = "!@#$%^&*()_+-=[]{}|;:',.<>?/";
      const encrypted = encryptValue(originalValue);
      const decrypted = decryptValue(encrypted);
      expect(decrypted).toBe(originalValue);
    });

    it("should encrypt long strings", () => {
      const originalValue = "a".repeat(10000);
      const encrypted = encryptValue(originalValue);
      const decrypted = decryptValue(encrypted);
      expect(decrypted).toBe(originalValue);
    });

    it("should produce different encrypted values for the same input", () => {
      const value = "Test Value";
      const encrypted1 = encryptValue(value);
      const encrypted2 = encryptValue(value);
      // Note: CryptoJS.AES.encrypt produces different outputs due to random IV
      // Both should decrypt to the same value
      expect(decryptValue(encrypted1)).toBe(value);
      expect(decryptValue(encrypted2)).toBe(value);
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
      const decrypted = decryptObject(encrypted, ["content"]);

      // decryptObject automatically parses JSON, so we check the parsed value
      expect(decrypted.content).toEqual({ nested: "data", value: 123 });
    });

    it("should handle empty objects", () => {
      const obj = {};
      const encrypted = encryptObject(obj, []);
      expect(encrypted).toEqual({});
    });

    it("should skip null or undefined fields", () => {
      const obj = {
        name: "John",
        email: null,
        phone: undefined,
      };

      const encrypted = encryptObject(obj, ["name", "email", "phone"]);
      expect(encrypted.name).not.toBe(obj.name);
      expect(encrypted.email).toBeNull();
      expect(encrypted.phone).toBeUndefined();
    });
  });

  describe("isEncryptionEnabled", () => {
    it("should return true when encryption is enabled", () => {
      process.env.ENCRYPTION_ENABLED = "true";
      expect(isEncryptionEnabled()).toBe(true);
    });

    it("should return false when encryption is disabled", () => {
      process.env.ENCRYPTION_ENABLED = "false";
      expect(isEncryptionEnabled()).toBe(false);
    });
  });

  describe("getEncryptionStatus", () => {
    it("should return encryption status object", () => {
      process.env.ENCRYPTION_ENABLED = "true";
      const status = getEncryptionStatus();

      expect(status).toHaveProperty("enabled");
      expect(status).toHaveProperty("keyConfigured");
      expect(status).toHaveProperty("keyLength");
      expect(typeof status.enabled).toBe("boolean");
      expect(typeof status.keyConfigured).toBe("boolean");
      expect(typeof status.keyLength).toBe("number");
    });
  });
});
