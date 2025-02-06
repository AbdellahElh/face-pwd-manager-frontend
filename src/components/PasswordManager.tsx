// src/components/PasswordManager.tsx
import React, { useState, useEffect } from "react";
import AddPwd from "./AddPwd";
import {
  ChevronLeftIcon,
  PlusIcon,
  TrashIcon,
  EyeIcon,
  EyeOffIcon,
} from "./icons/Icons";

interface PasswordEntry {
  id: number;
  website: string;
  title: string;
  username: string;
  password: string; // This is encrypted on the backend.
  notes?: string;
}

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL as string;

const PasswordManager: React.FC = () => {
  const [credentials, setCredentials] = useState<PasswordEntry[]>([]);
  const [showAddCredential, setShowAddCredential] = useState<boolean>(false);
  const [visiblePasswords, setVisiblePasswords] = useState<{
    [key: number]: boolean;
  }>({});

  // Fetch credentials for user id = 1 from backend on mount.
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

  const handleAddCredential = (title: string, password: string) => {
    const newCredential = {
      title,
      website: `https://www.${title}.com`, // you can later let the user input this as well
      username: "user@example.com", // In a real app, this should be user-provided.
      password,
      userId: 1, // Adjust as necessary (e.g., current user's id)
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
        <ul className="divide-y divide-gray-200">
          {credentials.map((entry) => (
            <li
              key={entry.id}
              className="flex items-center justify-between py-2 whitespace-nowrap"
            >
              {/* Left side: Credential text, which can shrink with truncation */}
              <div className="flex-1 flex items-center lg:w-md md:w-sm sm:w-xs xs:w-xxs gap-x-2 md:gap-x-4 overflow-hidden">
                <strong className="text-sm md:text-base truncate">
                  {entry.title}:
                </strong>
                <span className="text-xs md:text-sm truncate">
                  {visiblePasswords[entry.id] ? entry.password : "••••••••"}
                </span>
              </div>
              {/* Right side: Action buttons */}
              <div className="flex items-center gap-x-2 justify-end">
                <button
                  onClick={() => toggleVisibility(entry.id)}
                  className="hover:text-gray-700 flex-shrink-0"
                  title={
                    visiblePasswords[entry.id]
                      ? "Hide password"
                      : "Show password"
                  }
                >
                  {visiblePasswords[entry.id] ? (
                    <EyeOffIcon className="h-4 w-4 md:h-5 md:w-5" />
                  ) : (
                    <EyeIcon className="h-4 w-4 md:h-5 md:w-5" />
                  )}
                </button>
                <button
                  onClick={() => handleDeleteCredential(entry.id)}
                  className="flex items-center gap-x-1 bg-[#0a0a0a] text-white hover:text-red-600 px-2 sm:px-3 py-1 rounded-lg border border-transparent hover:border-red-600 transition flex-shrink-0"
                  title="Delete"
                >
                  <TrashIcon className="h-4 w-4 xs:h-3 xs:w-3 md:h-5 md:w-5" />
                  <span className="hidden sm:inline text-xs md:text-sm">
                    Delete
                  </span>
                </button>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
};

export default PasswordManager;
