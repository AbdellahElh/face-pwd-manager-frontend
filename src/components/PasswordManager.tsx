// src/components/PasswordManager.tsx
import React, { useState, useEffect } from "react";
import { encryptPassword, decryptPassword } from "../utils/crypto";
import AddPwd from "./AddPwd";
import { ChevronLeftIcon, PlusIcon, TrashIcon } from "./icons/Icons";

interface PasswordEntry {
  id: string;
  name: string;
  password: string; // Encrypted password
}

const PasswordManager: React.FC = () => {
  const [passwords, setPasswords] = useState<PasswordEntry[]>([]);
  const [showAddPassword, setShowAddPassword] = useState<boolean>(false);

  useEffect(() => {
    const storedPasswords = localStorage.getItem("passwords");
    if (storedPasswords) {
      setPasswords(JSON.parse(storedPasswords));
    }
  }, []);

  const handleAddPassword = (name: string, value: string) => {
    const encryptedPassword = encryptPassword(value);
    const newEntry: PasswordEntry = {
      id: Date.now().toString(),
      name,
      password: encryptedPassword,
    };

    const updatedPasswords = [...passwords, newEntry];
    setPasswords(updatedPasswords);
    localStorage.setItem("passwords", JSON.stringify(updatedPasswords));
  };

  const handleDeletePassword = (id: string) => {
    const updatedPasswords = passwords.filter((entry) => entry.id !== id);
    setPasswords(updatedPasswords);
    localStorage.setItem("passwords", JSON.stringify(updatedPasswords));
  };

  return (
    <div>
      <section className="w-md">
        <button
          onClick={() => setShowAddPassword(!showAddPassword)}
          className="flex flex-row items-center gap-2 mb-6 bg-[#0a0a0a] text-white hover:text-blue-600 rounded-lg border border-transparent hover:border-blue-600 transition"
        >
          {showAddPassword ? <ChevronLeftIcon /> : <PlusIcon />} New
        </button>

        {showAddPassword && <AddPwd onAddPassword={handleAddPassword} />}
      </section>

      <section className="w-xl p-6 rounded-lg justify-center align-center shadow-md">
        <h3 className="text-xl font-bold mb-4">Your Passwords</h3>
        <ul className="list-none p-0">
          {passwords.map((entry) => (
            <li
              key={entry.id}
              className="flex justify-between items-center gap-2 py-2 border-b"
            >
              <span>
                <strong>{entry.name}:</strong> {decryptPassword(entry.password)}
              </span>
              <button
                onClick={() => handleDeletePassword(entry.id)}
                className="flex flex-row items-center gap-2 bg-[#0a0a0a] text-white hover:text-red-600 px-3 py-1 rounded-lg border border-transparent hover:border-red-600 transition"
              >
                <TrashIcon /> Delete
              </button>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
};

export default PasswordManager;
