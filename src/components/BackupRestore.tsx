// src/components/BackupRestore.tsx
import React, { useRef, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { CredentialEntry } from "../models/Credential";
import {
  createBackup,
  downloadBackup,
  readBackupFile,
  restoreBackup,
} from "../services/backupService";
import { showErrorToast, showSuccessToast } from "../utils/toastUtils";
import Modal from "./Modal";
import { DownloadIcon, UploadIcon } from "./icons/Icons";

interface BackupRestoreProps {
  credentials: CredentialEntry[];
  onRestore: (restoredCredentials: CredentialEntry[]) => void;
}

const BackupRestore: React.FC<BackupRestoreProps> = ({
  credentials,
  onRestore,
}) => {
  const { encryptionKey } = useAuth();
  const [isRestoreDialogOpen, setIsRestoreDialogOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [restoreError, setRestoreError] = useState<string | null>(null);

  const handleBackup = () => {
    if (!encryptionKey) {
      showErrorToast("Authentication required for backup");
      return;
    }

    try {
      const backupJson = createBackup(credentials, encryptionKey);
      downloadBackup(backupJson);
      showSuccessToast("Backup created successfully");
    } catch (error) {
      console.error("Backup failed:", error);
      showErrorToast("Failed to create backup");
    }
  };

  const handleRestoreClick = () => {
    setRestoreError(null);
    setIsRestoreDialogOpen(true);
  };

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRestoreError(null);
    const file = event.target.files?.[0];

    if (!file) {
      setRestoreError("No file selected");
      return;
    }

    if (!encryptionKey) {
      setRestoreError("Authentication required for restore");
      return;
    }

    try {
      const backupJson = await readBackupFile(file);
      const restoredCredentials = restoreBackup(backupJson, encryptionKey);
      onRestore(restoredCredentials);
      setIsRestoreDialogOpen(false);
      showSuccessToast("Credentials restored successfully");

      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      console.error("Restore failed:", error);
      setRestoreError(
        "Failed to restore backup. Check your file and credentials."
      );
    }
  };

  return (
    <>
      <div className="flex gap-2 mt-4 mb-2">
        <button
          onClick={handleBackup}
          disabled={!encryptionKey || credentials.length === 0}
          className="group relative inline-flex items-center justify-center px-4 py-2 font-medium rounded-lg bg-[#001e29] text-white border border-cyan-500 shadow-[0_0_10px_1px_rgba(0,191,255,0.4)] hover:shadow-[0_0_15px_3px_rgba(0,191,255,0.6)] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span className="absolute inset-0 bg-gradient-to-r from-cyan-600/20 to-cyan-700/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg"></span>{" "}
          <span className="relative flex items-center gap-2 z-10">
            <DownloadIcon />
            Backup Passwords
          </span>
        </button>

        <button
          onClick={handleRestoreClick}
          disabled={!encryptionKey}
          className="group relative inline-flex items-center justify-center px-4 py-2 font-medium rounded-lg bg-[#001e29] text-white border border-cyan-500 shadow-[0_0_10px_1px_rgba(0,191,255,0.4)] hover:shadow-[0_0_15px_3px_rgba(0,191,255,0.6)] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span className="absolute inset-0 bg-gradient-to-r from-cyan-600/20 to-cyan-700/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg"></span>{" "}
          <span className="relative flex items-center gap-2 z-10">
            <UploadIcon />
            Restore from Backup
          </span>
        </button>
      </div>

      <Modal
        isOpen={isRestoreDialogOpen}
        onClose={() => setIsRestoreDialogOpen(false)}
      >
        <div className="p-4 w-full max-w-md">
          <h2 className="text-xl font-bold mb-4">Restore from Backup</h2>
          <p className="mb-3">
            Select a backup file to restore your passwords. The backup must have
            been created with the same account.
          </p>

          <p className="text-gray-400 text-sm mb-4">
            Warning: This will replace your current passwords with the ones from
            the backup.
          </p>

          <input
            type="file"
            accept=".json"
            ref={fileInputRef}
            onChange={handleFileUpload}
            className="hidden"
            id="backup-file-input"
          />

          <label htmlFor="backup-file-input">
            <div className="group relative inline-flex items-center justify-center px-4 py-2 font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors cursor-pointer">
              {" "}
              <span className="flex items-center gap-2">
                <UploadIcon />
                Select Backup File
              </span>
            </div>
          </label>

          {restoreError && (
            <div className="mt-4 p-3 bg-red-900/50 border border-red-500 rounded-lg text-red-200 shadow-md">
              {restoreError}
            </div>
          )}

          <div className="mt-6 flex justify-end">
            <button
              onClick={() => setIsRestoreDialogOpen(false)}
              className="px-4 py-2 bg-[#0a0a0a] text-white hover:text-gray-400 rounded-lg border border-transparent hover:border-gray-400 transition"
            >
              Cancel
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default BackupRestore;
