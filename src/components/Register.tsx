import React, { useRef, useState } from "react";
import { post } from "../data/apiClient";
import Webcam from "./Webcam";

const Register: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [selfie, setSelfie] = useState<Blob | null>(null);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const webcamRef = useRef<any>(null);

  const handleCapture = (imageBlob: Blob) => {
    setSelfie(imageBlob);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selfie) {
      setError("Please capture a selfie.");
      return;
    }
    const formData = new FormData();
    formData.append("email", email);
    formData.append("password", password);
    formData.append("selfie", selfie, "selfie.jpg");
    try {
      // register user via API client
      await post("/users/register", formData as any);
      setSuccess(true);
      setError("");
    } catch (err: any) {
      const message = err.response?.data?.message || "Registration failed";
      setError(message);
    }
  };

  return (
    <div className="max-w-md mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Register</h2>
      {success ? (
        <div className="text-green-600">Registration successful!</div>
      ) : (
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
            <label>Password:</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="border p-2 w-full"
              required
            />
          </div>
          <div>
            <label>Selfie:</label>
            <Webcam onCapture={handleCapture} />
            {selfie && (
              <div className="mt-2 text-green-600">Selfie captured!</div>
            )}
          </div>
          {error && <div className="text-red-600">{error}</div>}
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            Register
          </button>
        </form>
      )}
    </div>
  );
};

export default Register;
