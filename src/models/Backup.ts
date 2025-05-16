// src/models/Backup.ts
import { CredentialEntry } from "./Credential";

/**
 * Interface for unencrypted backup data
 */
export interface BackupData {
  /**
   * Array of credential entries
   */
  credentials: CredentialEntry[];

  /**
   * Timestamp when the backup was created
   */
  timestamp: number;

  /**
   * Version of the backup format
   */
  version: string;
}

/**
 * Interface for encrypted backup
 */
export interface EncryptedBackup {
  /**
   * Base64 encoded encrypted data
   */
  data: string;

  /**
   * Salt used for key derivation (encrypted with master key)
   */
  salt: string;

  /**
   * Backup format version
   */
  version: string;
}
