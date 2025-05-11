import React, { useState } from "react";
import useSWR, { mutate } from "swr";
import { fetchAll, post, remove } from "../data/apiClient";
import { authService } from "../services/authService";
import AddPwd from "./AddCredential";
import { CredentialEntry } from "./CredentialItem";
import CredentialList from "./CredentialList";
import { ChevronLeftIcon, PlusIcon } from "./icons/Icons";

const PasswordManager: React.FC = () => {
  const [showAddCredential, setShowAddCredential] = useState<boolean>(false);
  const [visiblePasswords, setVisiblePasswords] = useState<{
    [key: number]: boolean;
  }>({});

  // Get current user
  const user = authService.getCurrentUser();
  const userId = user?.id || 1; // Fallback to user id 1 if not found

  // Fetch credentials with SWR
  const { data: credentials = [], error } = useSWR<CredentialEntry[]>(
    `/credentials/user/${userId}`,
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
    } catch (err) {
      console.error("Error adding credential:", err);
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
    } catch (err) {
      console.error("Error deleting credential:", err);
    }
  };

  const toggleVisibility = (id: number) => {
    setVisiblePasswords((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div>
      {error && (
        <div className="text-red-500 mb-4">
          Error loading credentials. Please try again.
        </div>
      )}

      <section className="mb-6">
        <button
          onClick={() => setShowAddCredential(!showAddCredential)}
          className="flex items-center gap-2 mb-4 bg-[#0a0a0a] text-white hover:text-blue-600 rounded-lg border border-transparent hover:border-blue-600 transition px-4 py-2"
          title="Add new credential"
        >
          {showAddCredential ? <ChevronLeftIcon /> : <PlusIcon />} New
        </button>
        {showAddCredential && <AddPwd onAddCredential={handleAddCredential} />}
      </section>

      <section className="rounded-lg p-6 shadow-[0_0_5px_0_rgba(255,255,255,0.5)]">
        <h3 className="text-xl md:text-2xl font-bold mb-4">Your Credentials</h3>
        <CredentialList
          credentials={credentials}
          visiblePasswords={visiblePasswords}
          onToggleVisibility={toggleVisibility}
          onDelete={handleDeleteCredential}
        />
      </section>
    </div>
  );
};

export default PasswordManager;
