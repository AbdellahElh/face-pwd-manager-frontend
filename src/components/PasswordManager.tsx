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

// Use the Vite prefix for your environment variable.
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

  // Now we expect the add method to provide the title and password.
  // Here we use a static website and username for demonstration purposes.
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
      <section className="w-md">
        <button
          onClick={() => setShowAddCredential(!showAddCredential)}
          className="flex flex-row items-center gap-2 mb-6 bg-[#0a0a0a] text-white hover:text-blue-600 rounded-lg border border-transparent hover:border-blue-600 transition"
        >
          {showAddCredential ? <ChevronLeftIcon /> : <PlusIcon />} New
        </button>

        {showAddCredential && <AddPwd onAddCredential={handleAddCredential} />}
      </section>

      <section className="w-xl p-6 rounded-lg justify-center align-center shadow-md">
        <h3 className="text-xl font-bold mb-4">Your Credentials</h3>
        <ul className="list-none p-0">
          {credentials.map((entry) => (
            <li
              key={entry.id}
              className="flex justify-between items-center gap-2 py-2 border-b"
            >
              <div className="flex items-center gap-2">
                <strong>{entry.title}:</strong>
                <span>
                  {visiblePasswords[entry.id] ? entry.password : "••••••••"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => toggleVisibility(entry.id)}
                  className="hover:text-gray-700"
                  title={
                    visiblePasswords[entry.id]
                      ? "Hide password"
                      : "Show password"
                  }
                >
                  {visiblePasswords[entry.id] ? <EyeOffIcon /> : <EyeIcon />}
                </button>
                <button
                  onClick={() => handleDeleteCredential(entry.id)}
                  className="flex flex-row items-center gap-2 bg-[#0a0a0a] text-white hover:text-red-600 px-3 py-1 rounded-lg border border-transparent hover:border-red-600 transition"
                >
                  <TrashIcon /> Delete
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
