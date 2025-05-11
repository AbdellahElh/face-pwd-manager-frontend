import React, { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Webcam from "../components/Webcam";
import { post } from "../data/apiClient";
import { authService } from "../services/authService";

const Register: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [selfie, setSelfie] = useState<Blob | null>(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
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

    setIsLoading(true);

    const formData = new FormData();
    formData.append("email", email);
    formData.append("password", password);
    formData.append("selfie", selfie, "selfie.jpg");

    try {
      // register user via API client
      const response = await post("/users/register", formData as any);

      // After registration, log the user in automatically
      try {
        await authService.loginWithFace(email);
        navigate("/");
      } catch (loginErr) {
        // If auto-login fails, redirect to login page
        navigate("/login");
      }
    } catch (err: any) {
      const message = err.response?.data?.message || "Registration failed";
      setError(message);
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
        </div>{" "}
        {error && <div className="text-red-600">{error}</div>}
        <button
          type="submit"
          disabled={isLoading}
          className={`${
            isLoading ? "bg-gray-400" : "bg-blue-600"
          } text-white px-4 py-2 rounded`}
        >
          {isLoading ? "Processing..." : "Register"}
        </button>
      </form>
    </div>
  );
};

export default Register;
