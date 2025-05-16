// src/utils/imageEncryptionUtils.ts
import { decrypt, encrypt } from "./cryptoUtils";

/**
 * Convert a Blob to a base64 string
 * @param blob - The image blob to convert
 * @returns A promise that resolves to the base64 representation of the image
 */
export const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === "string") {
        // Remove the data URL prefix (e.g., "data:image/jpeg;base64,")
        const base64 = reader.result.split(",")[1];
        resolve(base64);
      } else {
        reject(new Error("Failed to convert blob to base64"));
      }
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

/**
 * Convert a base64 string to a Blob
 * @param base64 - The base64 string to convert
 * @param contentType - The content type of the blob (default: image/jpeg)
 * @returns A blob created from the base64 string
 */
export const base64ToBlob = (
  base64: string,
  contentType = "image/jpeg"
): Blob => {
  const byteCharacters = atob(base64);
  const byteArrays = [];

  for (let i = 0; i < byteCharacters.length; i += 512) {
    const slice = byteCharacters.slice(i, i + 512);
    const byteNumbers = new Array(slice.length);

    for (let j = 0; j < slice.length; j++) {
      byteNumbers[j] = slice.charCodeAt(j);
    }

    byteArrays.push(new Uint8Array(byteNumbers));
  }

  return new Blob(byteArrays, { type: contentType });
};

/**
 * Encrypt an image blob using AES encryption
 * @param imageBlob - The image blob to encrypt
 * @param encryptionKey - The key to use for encryption
 * @returns A promise that resolves to an object containing the encrypted data and original content type
 */
export const encryptImage = async (
  imageBlob: Blob,
  encryptionKey: string
): Promise<{ encryptedData: string; contentType: string }> => {
  try {
    // Convert image to base64
    const base64Data = await blobToBase64(imageBlob);

    // Encrypt the base64 data
    const encryptedData = encrypt(base64Data, encryptionKey);

    return {
      encryptedData,
      contentType: imageBlob.type,
    };
  } catch (error) {
    console.error("Failed to encrypt image:", error);
    throw new Error("Image encryption failed");
  }
};

/**
 * Decrypt encrypted image data and return as a Blob
 * @param encryptedData - The encrypted image data
 * @param contentType - The content type of the original image
 * @param encryptionKey - The key used for encryption
 * @returns A blob containing the decrypted image
 */
export const decryptImage = (
  encryptedData: string,
  contentType: string,
  encryptionKey: string
): Blob => {
  try {
    // Decrypt the data to get the base64
    const decryptedBase64 = decrypt(encryptedData, encryptionKey);

    // Convert back to a blob
    return base64ToBlob(decryptedBase64, contentType);
  } catch (error) {
    console.error("Failed to decrypt image:", error);
    throw new Error("Image decryption failed");
  }
};

/**
 * Creates an encrypted FormData object with an image
 * @param imageBlob - The image blob to encrypt
 * @param encryptionKey - The key to use for encryption
 * @param fieldName - The name to use for the image field in the FormData
 * @param additionalData - Additional data to include in the FormData
 * @returns A promise that resolves to a FormData object with encrypted image
 */
export const createEncryptedImageFormData = async (
  imageBlob: Blob,
  encryptionKey: string,
  fieldName: string = "image",
  additionalData: Record<string, string> = {}
): Promise<FormData> => {
  // Encrypt the image
  const { encryptedData, contentType } = await encryptImage(
    imageBlob,
    encryptionKey
  );

  // Create FormData with encrypted image and metadata
  const formData = new FormData();
  formData.append(`${fieldName}Encrypted`, encryptedData);
  formData.append(`${fieldName}ContentType`, contentType);
  formData.append(`${fieldName}IsEncrypted`, "true");

  // Add any additional data
  Object.entries(additionalData).forEach(([key, value]) => {
    formData.append(key, value);
  });

  return formData;
};
