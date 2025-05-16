// src/__tests__/utils/imageEncryptionUtils.test.ts
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import * as cryptoUtils from "../../utils/cryptoUtils";
import * as imageEncryptionUtils from "../../utils/imageEncryptionUtils";

// Mock the encrypt and decrypt functions from cryptoUtils
vi.mock("../../utils/cryptoUtils", () => ({
  encrypt: vi.fn((value) => `encrypted-${value}`),
  decrypt: vi.fn((value) => value.replace("encrypted-", "")),
  getUserEncryptionKey: vi.fn((userId, email) => `key-${userId}-${email}`),
}));

describe("Image Encryption Utilities", () => {
  // Create a test blob
  const createTestBlob = (content = "test-image-data", type = "image/jpeg") => {
    return new Blob([content], { type });
  };

  // Mock FormData since it's not available in happy-dom
  beforeEach(() => {
    global.FormData = class FormData {
      data: Record<string, any> = {};
      append(key: string, value: any) {
        this.data[key] = value;
      }
      get(key: string) {
        return this.data[key];
      }
      getAll(key: string) {
        return [this.data[key]];
      }
      entries() {
        return Object.entries(this.data)[Symbol.iterator]();
      }
    } as any;
  });

  describe("blobToBase64", () => {
    it("should convert a blob to base64 string", async () => {
      // Setup
      const blob = createTestBlob();

      // Mock FileReader for blob conversion
      const mockFileReader: any = {
        readAsDataURL: vi.fn(),
        onloadend: null,
        result: "data:image/jpeg;base64,test-base64-data",
      };
      global.FileReader = vi.fn(() => mockFileReader) as any;

      // Execute
      const promise = imageEncryptionUtils.blobToBase64(blob);
      // Simulate the FileReader onloadend event
      mockFileReader.onloadend();

      // Verify
      const base64 = await promise;
      expect(base64).toBe("test-base64-data");
      expect(mockFileReader.readAsDataURL).toHaveBeenCalledWith(blob);
    });

    it("should reject if FileReader fails", async () => {
      // Setup
      const blob = createTestBlob();

      // Mock FileReader for blob conversion
      const mockFileReader: any = {
        readAsDataURL: vi.fn(),
        onerror: null,
        onloadend: null,
      };
      global.FileReader = vi.fn(() => mockFileReader) as any;

      // Execute
      const promise = imageEncryptionUtils.blobToBase64(blob);

      // Simulate the FileReader error event
      const error = new Error("FileReader error");
      mockFileReader.onerror(error);

      // Verify
      await expect(promise).rejects.toBe(error);
    });
  });

  describe("base64ToBlob", () => {
    beforeEach(() => {
      // Mock atob
      global.atob = vi.fn((str) => str);
    });

    it("should convert a base64 string to blob", () => {
      // Setup
      const base64 = "test-base64-data";

      // Execute
      const blob = imageEncryptionUtils.base64ToBlob(base64);

      // Verify
      expect(blob).toBeInstanceOf(Blob);
      expect(blob.type).toBe("image/jpeg"); // Default content type
    });

    it("should use the specified content type", () => {
      // Setup
      const base64 = "test-base64-data";
      const contentType = "image/png";

      // Execute
      const blob = imageEncryptionUtils.base64ToBlob(base64, contentType);

      // Verify
      expect(blob.type).toBe(contentType);
    });
  });

  describe("encryptImage", () => {
    it("should encrypt an image blob", async () => {
      // Setup
      const imageBlob = createTestBlob();
      const encryptionKey = "test-key";

      // Mock blobToBase64
      const originalBlobToBase64 = imageEncryptionUtils.blobToBase64;
      vi.spyOn(imageEncryptionUtils, "blobToBase64").mockResolvedValue(
        "test-base64-data"
      );

      // Execute
      const result = await imageEncryptionUtils.encryptImage(
        imageBlob,
        encryptionKey
      );

      // Verify
      expect(result).toHaveProperty("encryptedData");
      expect(result).toHaveProperty("contentType");
      expect(result.encryptedData).toBe("encrypted-test-base64-data");
      expect(result.contentType).toBe("image/jpeg");
    });

    it("should throw an error if encryption fails", async () => {
      // Setup
      const imageBlob = createTestBlob();
      const encryptionKey = "test-key";

      // Mock blobToBase64 to throw an error
      vi.spyOn(imageEncryptionUtils, "blobToBase64").mockRejectedValue(
        new Error("Conversion error")
      );

      // Execute & Verify
      await expect(
        imageEncryptionUtils.encryptImage(imageBlob, encryptionKey)
      ).rejects.toThrow("Image encryption failed");
    });
  });

  describe("decryptImage", () => {
    it("should decrypt encrypted image data", () => {
      // Setup
      const encryptedData = "encrypted-test-base64-data";
      const contentType = "image/jpeg";
      const encryptionKey = "test-key";

      // Mock base64ToBlob
      const mockBlob = createTestBlob();
      vi.spyOn(imageEncryptionUtils, "base64ToBlob").mockReturnValue(mockBlob);

      // Execute
      const result = imageEncryptionUtils.decryptImage(
        encryptedData,
        contentType,
        encryptionKey
      );

      // Verify
      expect(result).toBe(mockBlob);
      expect(vi.mocked(imageEncryptionUtils.base64ToBlob)).toHaveBeenCalledWith(
        "test-base64-data",
        contentType
      );
    });

    it("should throw an error if decryption fails", async () => {
      // Setup
      const encryptedData = "encrypted-test-base64-data";
      const contentType = "image/jpeg";
      const encryptionKey = "test-key";

      // Mock decrypt to throw an error
      vi.spyOn(cryptoUtils, "decrypt").mockImplementationOnce(() => {
        throw new Error("Decryption error");
      });

      // Execute & Verify
      expect(() =>
        imageEncryptionUtils.decryptImage(
          encryptedData,
          contentType,
          encryptionKey
        )
      ).toThrow("Image decryption failed");
    });
  });

  describe("createEncryptedImageFormData", () => {
    it("should create FormData with encrypted image", async () => {
      // Setup
      const imageBlob = createTestBlob();
      const encryptionKey = "test-key";

      // Mock encryptImage
      const mockEncryptResult = {
        encryptedData: "encrypted-data",
        contentType: "image/jpeg",
      };
      vi.spyOn(imageEncryptionUtils, "encryptImage").mockResolvedValue(
        mockEncryptResult
      );

      // Execute
      const formData = await imageEncryptionUtils.createEncryptedImageFormData(
        imageBlob,
        encryptionKey,
        "image",
        { email: "test@example.com" }
      );

      // Verify
      expect(formData).toBeInstanceOf(FormData);
      expect(formData.get("imageEncrypted")).toBe("encrypted-data");
      expect(formData.get("imageContentType")).toBe("image/jpeg");
      expect(formData.get("imageIsEncrypted")).toBe("true");
      expect(formData.get("email")).toBe("test@example.com");
    });

    it("should use default field name if not specified", async () => {
      // Setup
      const imageBlob = createTestBlob();
      const encryptionKey = "test-key";

      // Mock encryptImage
      const mockEncryptResult = {
        encryptedData: "encrypted-data",
        contentType: "image/jpeg",
      };
      vi.spyOn(imageEncryptionUtils, "encryptImage").mockResolvedValue(
        mockEncryptResult
      );

      // Execute
      const formData = await imageEncryptionUtils.createEncryptedImageFormData(
        imageBlob,
        encryptionKey
      );

      // Verify
      expect(formData).toBeInstanceOf(FormData);
      expect(formData.get("imageEncrypted")).toBe("encrypted-data");
    });
  });

  // Clean up after tests
  afterEach(() => {
    vi.restoreAllMocks();
  });
});
