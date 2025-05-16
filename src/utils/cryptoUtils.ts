// src/utils/cryptoUtils.ts
import AES from "crypto-js/aes";
import UTF8 from "crypto-js/enc-utf8";
import { showErrorToast } from "./toastUtils";

/**
 * Encrypts a string value using AES encryption
 * @param value The value to encrypt
 * @param secretKey The secret key to use for encryption
 * @returns The encrypted value as a string
 */
export const encrypt = (value: string, secretKey: string): string => {
  if (!value) return "";
  return AES.encrypt(value, secretKey).toString();
};

/**
 * Decrypts an encrypted string value using AES encryption
 * @param encryptedValue The encrypted value to decrypt
 * @param secretKey The secret key used for encryption
 * @returns The decrypted value as a string
 */
export const decrypt = (encryptedValue: string, secretKey: string): string => {
  if (!encryptedValue) return "";
  try {
    const bytes = AES.decrypt(encryptedValue, secretKey);
    return bytes.toString(UTF8);
  } catch (error) {
    console.error("Failed to decrypt value:", error);
    showErrorToast("Decryption failed. Please check your credentials.");
    return "";
  }
};

/**
 * Generates a user-specific encryption key based on their ID and email
 * This ensures each user has a unique key
 * @param userId The user's ID
 * @param userEmail The user's email
 * @returns A unique key for the user
 */
export const getUserEncryptionKey = (
  userId: number,
  userEmail: string
): string => {
  return `pwd-manager-${userId}-${userEmail}`;
};
