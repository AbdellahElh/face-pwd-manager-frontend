// src/components/AddPwd.tsx
import React, { useState } from "react";
import generateStrongPassword from "./GeneratePwd";
import { PlusIcon, EyeIcon, EyeOffIcon } from "./icons/Icons";

interface AddPwdProps {
  onAddCredential: (
    website: string,
    title: string,
    username: string,
    password: string
  ) => void;
}

const AddPwd: React.FC<AddPwdProps> = ({ onAddCredential }) => {
  const [website, setWebsite] = useState<string>("");
  const [title, setTitle] = useState<string>("");
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [passwordVisible, setPasswordVisible] = useState<boolean>(false);

  const handleAdd = () => {
    if (!website || !username || !password) return;
    onAddCredential(website, title, username, password);
    setWebsite("");
    setTitle("");
    setUsername("");
    setPassword("");
  };

  const handleGeneratePassword = () => {
    const generated = generateStrongPassword(10);
    setPassword(generated);
  };

  const toggleVisibility = () => {
    setPasswordVisible((prev) => !prev);
  };

  return (
    <div className="flex flex-col gap-2">
      <h3 className="text-xl md:text-2xl font-bold my-4">New Credential</h3>
      <input
        type="text"
        placeholder="Website URI (e.g., www.instagram.com)"
        value={website}
        onChange={(e) => setWebsite(e.target.value)}
        className="p-2 mb-4 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600 transition"
      />
      <input
        type="text"
        placeholder="Username or email (e.g., user@service.com)"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        className="p-2 mb-4 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600 transition"
      />
      <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden focus-within:border-blue-600 transition">
        <input
          type={passwordVisible ? "text" : "password"}
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="p-2 flex-grow outline-none"
        />
        <div className="flex pr-3">
          <button
            onClick={toggleVisibility}
            title={passwordVisible ? "Hide password" : "Show password"}
          >
            {passwordVisible ? (
              <EyeOffIcon className="h-5 w-5 text-gray-600 hover:text-blue-600" />
            ) : (
              <EyeIcon className="h-5 w-5 text-gray-600 hover:text-blue-600" />
            )}
          </button>
          <button
            onClick={handleGeneratePassword}
            title="Generate strong password"
          >
            <PlusIcon className="h-5 w-5 text-gray-600 hover:text-blue-600" />
          </button>
        </div>
      </div>
      <button
        onClick={handleAdd}
        className="bg-[#0a0a0a] text-white hover:text-blue-600 px-4 py-2 my-4 rounded-lg border border-transparent hover:border-blue-600 transition"
      >
        Add Credential
      </button>
    </div>
  );
};

export default AddPwd;
