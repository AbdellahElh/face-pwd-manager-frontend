// src/services/backupService.ts
import { BackupData, EncryptedBackup } from "../models/Backup";
import { CredentialEntry } from "../models/Credential";
import { decrypt, encrypt } from "../utils/cryptoUtils";
import { showErrorToast, showSuccessToast } from "../utils/toastUtils";

/**
 * Create an encrypted backup of credentials
 * @param credentials The credentials to backup
 * @param encryptionKey The encryption key to use
 * @returns A JSON string representing the encrypted backup
 */
export const createBackup = (
  credentials: CredentialEntry[],
  encryptionKey: string
): string => {
  try {
    // Create backup data object
    const backupData: BackupData = {
      credentials,
      timestamp: Date.now(),
      version: "1.0.0", // Backup format version
    };

    // Convert to JSON string and encrypt
    const jsonData = JSON.stringify(backupData);
    const encryptedData = encrypt(jsonData, encryptionKey);

    // Create backup object with metadata
    const backup: EncryptedBackup = {
      data: encryptedData,
      salt: encrypt(
        import.meta.env.VITE_ENCRYPTION_SALT || "default-salt",
        encryptionKey
      ),
      version: "1.0.0",
    };

    return JSON.stringify(backup);
  } catch (error) {
    console.error("Failed to create backup:", error);
    showErrorToast("Failed to create backup");
    throw error;
  }
};

/**
 * Restore credentials from an encrypted backup
 * @param backupJson The JSON string representing the encrypted backup
 * @param encryptionKey The encryption key to use
 * @returns The restored credentials
 */
export const restoreBackup = (
  backupJson: string,
  encryptionKey: string
): CredentialEntry[] => {
  try {
    // Parse backup object
    const backup: EncryptedBackup = JSON.parse(backupJson);

    // Verify backup version
    if (backup.version !== "1.0.0") {
      throw new Error(`Unsupported backup version: ${backup.version}`);
    }

    // Decrypt and parse backup data
    const decryptedJson = decrypt(backup.data, encryptionKey);
    const backupData: BackupData = JSON.parse(decryptedJson);

    showSuccessToast("Backup restored successfully");
    return backupData.credentials;
  } catch (error) {
    console.error("Failed to restore backup:", error);
    showErrorToast(
      "Failed to restore backup. Check your encryption key and the backup file."
    );
    throw error;
  }
};

/**
 * Download the backup as a JSON file
 * @param backupJson The JSON string representing the encrypted backup
 */
export const downloadBackup = (backupJson: string) => {
  const blob = new Blob([backupJson], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = `pwd-manager-backup-${new Date()
    .toISOString()
    .slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();

  // Clean up
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 0);
};

/**
 * Read a backup file
 * @param file The backup file to read
 * @returns A Promise that resolves to the backup JSON string
 */
export const readBackupFile = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const result = event.target?.result as string;
        resolve(result);
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = (error) => {
      reject(error);
    };

    reader.readAsText(file);
  });
};
