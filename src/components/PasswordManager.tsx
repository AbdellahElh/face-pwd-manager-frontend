import React, { useState, useEffect } from "react";
import AddPwd from "./AddPwd";
import CredentialList from "./CredentialList";
import { ChevronLeftIcon, PlusIcon } from "./icons/Icons";
import { CredentialEntry } from "./Credential";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL as string;

const PasswordManager: React.FC = () => {
  const [credentials, setCredentials] = useState<CredentialEntry[]>([]);
  const [showAddCredential, setShowAddCredential] = useState<boolean>(false);
  const [visiblePasswords, setVisiblePasswords] = useState<{
    [key: number]: boolean;
  }>({});

  // Fetch credentials for user id = 1 on mount.
  useEffect(() => {
    fetch(`${BACKEND_URL}/credentials/user/1`)
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => setCredentials(data))
      .catch((err) =>
        console.error("Error fetching credentials for user 1:", err)
      );
  }, []);

  const handleAddCredential = (
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
      userId: 1, // Adjust as needed for the current user
    };

    fetch(`${BACKEND_URL}/credentials`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newCredential),
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then((createdEntry) => {
        setCredentials((prev) => [...prev, createdEntry]);
      })
      .catch((err) => console.error("Error adding credential:", err));
  };

  const handleDeleteCredential = (id: number) => {
    fetch(`${BACKEND_URL}/credentials/${id}`, { method: "DELETE" })
      .then((res) => res.json())
      .then(() => {
        setCredentials((prev) => prev.filter((entry) => entry.id !== id));
      })
      .catch((err) => console.error("Error deleting credential:", err));
  };

  const toggleVisibility = (id: number) => {
    setVisiblePasswords((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div>
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
