// src/components/PasswordManager.tsx
import React, { useState, useEffect } from "react";
import { encryptPassword, decryptPassword } from "../utils/crypto";

interface PasswordEntry {
  id: string;
  name: string;
  password: string; // Encrypted password
}

const PasswordManager: React.FC = () => {
  const [passwords, setPasswords] = useState<PasswordEntry[]>([]);
  const [newPasswordName, setNewPasswordName] = useState<string>("");
  const [newPasswordValue, setNewPasswordValue] = useState<string>("");

  useEffect(() => {
    const storedPasswords = localStorage.getItem("passwords");
    if (storedPasswords) {
      setPasswords(JSON.parse(storedPasswords));
    }
  }, []);

  const handleAddPassword = () => {
    if (!newPasswordName || !newPasswordValue) return;

    const encryptedPassword = encryptPassword(newPasswordValue);
    const newEntry: PasswordEntry = {
      id: Date.now().toString(),
      name: newPasswordName,
      password: encryptedPassword,
    };

    const updatedPasswords = [...passwords, newEntry];
    setPasswords(updatedPasswords);
    localStorage.setItem("passwords", JSON.stringify(updatedPasswords));

    setNewPasswordName("");
    setNewPasswordValue("");
  };

  const handleDeletePassword = (id: string) => {
    const updatedPasswords = passwords.filter((entry) => entry.id !== id);
    setPasswords(updatedPasswords);
    localStorage.setItem("passwords", JSON.stringify(updatedPasswords));
  };

  return (
    <div className="">
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
                className="bg-[#0a0a0a] text-white hover:text-red-600 px-3 py-1 rounded-lg border border-transparent hover:border-red-600 transition"
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
};

export default PasswordManager;
