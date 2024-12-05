// src/components/PasswordManager/PasswordManager.tsx
import React, { useState, useEffect } from "react";
import { encryptPassword, decryptPassword } from "../../utils/crypto";
import "./PasswordManager.css";

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
    <div className="password-manager">
      <h3>Add New Password</h3>
      <input
        type="text"
        placeholder="Service Name"
        value={newPasswordName}
        onChange={(e) => setNewPasswordName(e.target.value)}
      />
      <input
        type="password"
        placeholder="Password"
        value={newPasswordValue}
        onChange={(e) => setNewPasswordValue(e.target.value)}
      />
      <button onClick={handleAddPassword}>Add Password</button>

      <h3>Your Passwords</h3>
      <ul>
        {passwords.map((entry) => (
          <li key={entry.id}>
            <strong>{entry.name}:</strong> {decryptPassword(entry.password)}
            <button onClick={() => handleDeletePassword(entry.id)}>
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PasswordManager;
