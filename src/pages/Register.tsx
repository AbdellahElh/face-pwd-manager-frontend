// src/components/Register.tsx
import React, { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Webcam from "../components/Webcam";
import { useAuth } from "../context/AuthContext";
import { post } from "../data/apiClient";

const Register: React.FC = () => {
  const [email, setEmail] = useState("");
  const [selfie, setSelfie] = useState<Blob | null>(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleCapture = (blob: Blob) => setSelfie(blob);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selfie) {
      setError("Please capture a selfie.");
      return;
    }
    setIsLoading(true);
    const formData = new FormData();
    formData.append("email", email);
    formData.append("selfie", selfie, "selfie.jpg");
    try {
      await post("/users/register", formData as any);
      await login(email, selfie);
      navigate("/");
    } catch (err: any) {
      console.error("Register error:", err);
      setError(err.response?.data?.message || "Registration failed");
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label>Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border p-2 w-full"
            required
          />
        </div>
        <div>
          <label>Selfie:</label>
          <Webcam onCapture={handleCapture} />
          {selfie && <div className="mt-2 text-green-600">Selfie captured!</div>}
        </div>
        {error && <div className="text-red-600">{error}</div>}
        <button
          type="submit"
          disabled={isLoading}
          className={`${isLoading ? "bg-gray-400" : "bg-blue-600"} text-white px-4 py-2 rounded`}
        >
          {isLoading ? "Processing..." : "Register"}
        </button>
      </form>
    </div>
  );
};

export default Register;
