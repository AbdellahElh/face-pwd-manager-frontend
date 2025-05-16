import React, { useEffect, useState } from "react";
import useSWR, { mutate } from "swr";
import AddPwd from "../components/AddCredential";
import BackupRestore from "../components/BackupRestore";
import CredentialDetailModal from "../components/CredentialDetailModal";
import CredentialList from "../components/CredentialList";
import Modal from "../components/Modal";
import { useAuth } from "../context/AuthContext";
import { CredentialEntry } from "../models/Credential";
import {
  createCredential,
  deleteCredential,
  fetchCredentials,
  updateCredential,
} from "../services/credentialService";
import { isSecureConnection } from "../utils/securityUtils";
import { showErrorToast, showSuccessToast } from "../utils/toastUtils";

const PasswordManager: React.FC = () => {
  const { user, isLoggedIn, encryptionKey } = useAuth();
  const [isSecure, setIsSecure] = useState<boolean>(true);

  // Check for secure connection when component mounts
  useEffect(() => {
    const secure = isSecureConnection();
    setIsSecure(secure);

    if (!secure) {
      showErrorToast(
        "Warning: Your connection is not secure. Password data may be at risk.",
        { duration: 6000 }
      );
    }
  }, []);

  const userId = user?.id;
  const [showAddCredentialModal, setShowAddCredentialModal] =
    useState<boolean>(false);
  const [selectedCredential, setSelectedCredential] =
    useState<CredentialEntry | null>(null);
  const [visiblePasswords, setVisiblePasswords] = useState<{
    [key: number]: boolean;
  }>({});

  // Custom fetcher function that uses our credential service
  const credentialFetcher = async (url: string) => {
    const id = Number(userId);
    if (isNaN(id) || !encryptionKey) return [];
    return await fetchCredentials(id, encryptionKey);
  };

  // Only fetch once we have a valid userId
  const swrKey = userId != null ? `/credentials/user/${userId}` : null;
  const { data: credentials = [], error } = useSWR<CredentialEntry[]>(
    swrKey,
    credentialFetcher
  );

  const handleAddCredential = async (
    website: string,
    title: string,
    username: string,
    password: string
  ) => {
    if (!userId || !encryptionKey) {
      showErrorToast("Authentication error. Please log in again.");
      return;
    }

    try {
      const newCredential = {
        website,
        title,
        username,
        password,
      };

      const createdEntry = await createCredential(
        newCredential,
        userId,
        encryptionKey
      );

      // Update the SWR cache with the new credential
      mutate(
        `/credentials/user/${userId}`,
        [...credentials, createdEntry],
        false
      );

      // Close the modal after successful creation
      setShowAddCredentialModal(false);
      showSuccessToast("Credential added successfully");
    } catch (err) {
      console.error("Error adding credential:", err);
      showErrorToast("Failed to add credential");
    }
  };

  const handleUpdateCredential = async (updatedCredential: CredentialEntry) => {
    if (!encryptionKey) {
      showErrorToast("Authentication error. Please log in again.");
      return;
    }

    try {
      // Make sure userId is included in the update
      const credentialToUpdate = {
        ...updatedCredential,
        userId,
      };

      const updated = await updateCredential(credentialToUpdate, encryptionKey);

      // Update the SWR cache with the updated credential
      mutate(
        `/credentials/user/${userId}`,
        credentials.map((c) => (c.id === updated.id ? updated : c)),
        false
      );
    } catch (err) {
      console.error("Error updating credential:", err);
      throw err;
    }
  };

  const handleDeleteCredential = async (id: number) => {
    try {
      await deleteCredential(id);

      // Update the SWR cache to remove the deleted credential
      mutate(
        `/credentials/user/${userId}`,
        credentials.filter((entry) => entry.id !== id),
        false
      );

      showSuccessToast("Credential deleted successfully");
    } catch (err) {
      console.error("Error deleting credential:", err);
      showErrorToast("Failed to delete credential");
    }
  };

  const toggleVisibility = (id: number) => {
    const newVisibility = !visiblePasswords[id];
    setVisiblePasswords((prev) => ({ ...prev, [id]: newVisibility }));
    showSuccessToast(newVisibility ? "Password visible" : "Password hidden");
  };

  const handleCredentialClick = (credential: CredentialEntry) => {
    setSelectedCredential(credential);
  };
  return (
    <div>
      {error && (
        <div className="text-red-500 mb-4">
          Error loading credentials. Please try again.
        </div>
      )}
      {!isSecure && (
        <div className="mb-4 p-3 bg-red-900/50 border border-red-500 rounded-lg text-red-200 shadow-md">
          <strong>⚠️ Security Warning:</strong> You are not using a secure
          connection (HTTPS). Your passwords and sensitive data may be at risk
          of interception. Consider switching to a secure connection before
          managing passwords.
        </div>
      )}{" "}
      <section className="rounded-lg p-6 shadow-[0_0_5px_0_rgba(255,255,255,0.5)]">
        <CredentialList
          credentials={credentials}
          visiblePasswords={visiblePasswords}
          onToggleVisibility={toggleVisibility}
          onDelete={handleDeleteCredential}
          onAddNew={() => setShowAddCredentialModal(true)}
          onCredentialClick={handleCredentialClick}
        />

        <BackupRestore
          credentials={credentials}
          onRestore={(restoredCredentials) => {
            // Update the SWR cache with restored credentials
            mutate(`/credentials/user/${userId}`, restoredCredentials, false);
            showSuccessToast("Credentials restored successfully");
          }}
        />
      </section>
      <Modal
        isOpen={showAddCredentialModal}
        onClose={() => setShowAddCredentialModal(false)}
      >
        <AddPwd onAddCredential={handleAddCredential} />
      </Modal>
      <Modal
        isOpen={selectedCredential !== null}
        onClose={() => setSelectedCredential(null)}
      >
        {selectedCredential && (
          <CredentialDetailModal
            credential={selectedCredential}
            onDelete={handleDeleteCredential}
            onUpdate={handleUpdateCredential}
          />
        )}
      </Modal>
    </div>
  );
};

export default PasswordManager;
