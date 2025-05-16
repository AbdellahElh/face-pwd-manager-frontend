// src/__tests__/utils/cryptoUtils.test.ts
import { describe, expect, it } from "vitest";
import {
  decrypt,
  encrypt,
  getUserEncryptionKey,
  strengthenKey,
} from "../../utils/cryptoUtils";

describe("Cryptography Utilities", () => {
  // Test strengthenKey function
  describe("strengthenKey", () => {
    it("should return a deterministic strengthened key", () => {
      const baseKey = "testKey123";
      const result1 = strengthenKey(baseKey);
      const result2 = strengthenKey(baseKey);

      expect(result1).toBeDefined();
      expect(result1).toBe(result2); // Should be deterministic
      expect(result1.length).toBeGreaterThan(baseKey.length); // Should be longer than the original key
    });

    it("should produce different results for different inputs", () => {
      const key1 = strengthenKey("password1");
      const key2 = strengthenKey("password2");

      expect(key1).not.toBe(key2);
    });
  });

  // Test encryption and decryption
  describe("encrypt and decrypt", () => {
    it("should encrypt and decrypt a string correctly", () => {
      const originalText = "This is a secret message";
      const secretKey = "mySecretKey123";

      const encrypted = encrypt(originalText, secretKey);
      expect(encrypted).toBeDefined();
      expect(encrypted).not.toBe(originalText); // Encryption should change the text

      const decrypted = decrypt(encrypted, secretKey);
      expect(decrypted).toBe(originalText); // Decryption should restore the original text
    });

    it("should return different encrypted values for the same input with different keys", () => {
      const text = "Same text";
      const key1 = "key1";
      const key2 = "key2";

      const encrypted1 = encrypt(text, key1);
      const encrypted2 = encrypt(text, key2);

      expect(encrypted1).not.toBe(encrypted2);
    });

    it("should fail decryption with incorrect key", () => {
      const originalText = "Secret data";
      const correctKey = "correctKey";
      const wrongKey = "wrongKey";

      const encrypted = encrypt(originalText, correctKey);
      const decrypted = decrypt(encrypted, wrongKey);

      expect(decrypted).not.toBe(originalText);
      expect(decrypted).toBe(""); // Our implementation returns empty string on error
    });

    it("should handle empty strings", () => {
      const emptyText = "";
      const key = "someKey";

      const encrypted = encrypt(emptyText, key);
      expect(encrypted).toBe("");

      const decrypted = decrypt(encrypted, key);
      expect(decrypted).toBe("");
    });
  });

  // Test getUserEncryptionKey function
  describe("getUserEncryptionKey", () => {
    it("should generate consistent user-specific keys", () => {
      const userId = 123;
      const userEmail = "test@example.com";

      const key1 = getUserEncryptionKey(userId, userEmail);
      const key2 = getUserEncryptionKey(userId, userEmail);

      expect(key1).toBe(key2); // Should be deterministic
    });

    it("should generate different keys for different users", () => {
      const key1 = getUserEncryptionKey(123, "user1@example.com");
      const key2 = getUserEncryptionKey(456, "user2@example.com");

      expect(key1).not.toBe(key2);
    });

    it("should generate different keys for same ID but different emails", () => {
      const userId = 123;
      const key1 = getUserEncryptionKey(userId, "user1@example.com");
      const key2 = getUserEncryptionKey(userId, "user2@example.com");

      expect(key1).not.toBe(key2);
    });
  });
});
