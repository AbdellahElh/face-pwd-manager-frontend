import React, { useState } from "react";
import useSWR, { mutate } from "swr";
import AddPwd from "../components/AddCredential";
import CredentialDetailModal from "../components/CredentialDetailModal";
import CredentialList from "../components/CredentialList";
import Modal from "../components/Modal";
import { useAuth } from "../context/AuthContext";
import { fetchAll, post, put, remove } from "../data/apiClient";
import { CredentialEntry } from "../models/Credential";
import { showErrorToast, showSuccessToast } from "../utils/toastUtils";

const PasswordManager: React.FC = () => {
  const { user, isLoggedIn } = useAuth();

  const userId = user?.id;
  const [showAddCredentialModal, setShowAddCredentialModal] =
    useState<boolean>(false);
  const [selectedCredential, setSelectedCredential] =
    useState<CredentialEntry | null>(null);
  const [visiblePasswords, setVisiblePasswords] = useState<{
    [key: number]: boolean;
  }>({});

  // Only fetch once we have a valid userId
  const swrKey = userId != null ? `/credentials/user/${userId}` : null;
  const { data: credentials = [], error } = useSWR<CredentialEntry[]>(
    swrKey,
    fetchAll
  );
  const handleAddCredential = async (
    website: string,
    title: string,
    username: string,
    password: string
  ) => {
    const newCredential = {
      website,
      title,
      username,
      password,
      userId,
    };

    try {
      const createdEntry = await post<typeof newCredential, CredentialEntry>(
        "/credentials",
        newCredential
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
    try {
      // Make sure userId is included in the update
      const credentialToUpdate = {
        ...updatedCredential,
        userId,
      };

      const updated = await put<typeof credentialToUpdate, CredentialEntry>(
        "/credentials",
        credentialToUpdate
      );

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
      await remove("/credentials", id);

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

      <section className="rounded-lg p-6 shadow-[0_0_5px_0_rgba(255,255,255,0.5)]">
        <CredentialList
          credentials={credentials}
          visiblePasswords={visiblePasswords}
          onToggleVisibility={toggleVisibility}
          onDelete={handleDeleteCredential}
          onAddNew={() => setShowAddCredentialModal(true)}
          onCredentialClick={handleCredentialClick}
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
