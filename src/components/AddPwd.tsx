// src/components/AddPwd.tsx
import React, { useState } from "react";

interface AddPwdProps {
  onAddCredential: (title: string, password: string) => void;
}

const AddPwd: React.FC<AddPwdProps> = ({ onAddCredential }) => {
  const [title, setTitle] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  const handleAdd = () => {
    if (!title || !password) return;
    onAddCredential(title, password);
    setTitle("");
    setPassword("");
  };

  return (
    <div className="flex flex-col gap-2">
      <input
        type="text"
        placeholder="Service Title (e.g., Instagram)"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="p-2 mb-4 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600 transition"
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="p-2 mb-4 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600 transition"
      />
      <button
        onClick={handleAdd}
        className="bg-[#0a0a0a] text-white hover:text-blue-600 px-4 py-2 rounded-lg border border-transparent hover:border-blue-600 transition"
      >
        Add Credential
      </button>
    </div>
  );
};

export default AddPwd;
