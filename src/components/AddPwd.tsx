// src/components/AddPwd.tsx
import React, { useState } from "react";
import { encryptPassword } from "../utils/crypto";

interface AddPwdProps {
  onAddPassword: (name: string, value: string) => void;
}

const AddPwd: React.FC<AddPwdProps> = ({ onAddPassword }) => {
  const [newPasswordName, setNewPasswordName] = useState<string>("");
  const [newPasswordValue, setNewPasswordValue] = useState<string>("");

  const handleAddPassword = () => {
    if (!newPasswordName || !newPasswordValue) return;

    onAddPassword(newPasswordName, newPasswordValue);

    setNewPasswordName("");
    setNewPasswordValue("");
  };

  return (
    <div className="flex flex-col gap-2">
      <input
        type="text"
        placeholder="Service Name"
        value={newPasswordName}
        onChange={(e) => setNewPasswordName(e.target.value)}
        className="p-2 mb-4 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600 hover:border-blue-600 transition"
      />
      <input
        type="password"
        placeholder="Password"
        value={newPasswordValue}
        onChange={(e) => setNewPasswordValue(e.target.value)}
        className="p-2 mb-4 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600 hover:border-blue-600 transition"
      />
      <button
        onClick={handleAddPassword}
        className="bg-[#0a0a0a] text-white hover:text-blue-600 px-4 py-2 rounded-lg border border-transparent hover:border-blue-600 transition"
      >
        Add Password
      </button>
    </div>
  );
};

export default AddPwd;
