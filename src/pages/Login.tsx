// src/pages/Login.tsx
import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import FaceRecognition from "../components/FaceRecognition";
import Webcam from "../components/Webcam";

const Login: React.FC = () => {
  const [email, setEmail] = useState("");
  const [isEmailStep, setIsEmailStep] = useState(true);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);

  // Check if user is already logged in
  useEffect(() => {
    const savedUser = localStorage.getItem("user");

    if (savedUser) {
      try {
        const user = JSON.parse(savedUser);
        if (user && user.email) {
          setEmail(user.email);
          setIsEmailStep(false); // Skip to face recognition
        }
      } catch (e) {
        // Invalid JSON in localStorage, ignore and proceed with login
        localStorage.removeItem("user");
      }
    }
  }, []);

  // If authenticated, redirect to home
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsEmailStep(false);
  };

  const handleAuthenticated = () => {
    // Save user to local storage for future logins
    localStorage.setItem("user", JSON.stringify({ email }));
    setIsAuthenticated(true);
  };

  const handleError = (errorMessage: string) => {
    setError(errorMessage);
    setIsLoading(false);
  };

  const goToRegister = () => {
    navigate("/register");
  };

  const resetLogin = () => {
    setIsEmailStep(true);
    setEmail("");
    setError("");
  };

  if (isEmailStep) {
    return (
      <div className="max-w-md mx-auto p-4">
        <h2 className="text-xl font-bold mb-4">Login</h2>
        <form onSubmit={handleEmailSubmit} className="space-y-4">
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
          {error && <div className="text-red-600">{error}</div>}
          <div className="flex justify-between">
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded"
            >
              Continue
            </button>
            <button
              type="button"
              onClick={goToRegister}
              className="bg-gray-300 text-gray-800 px-4 py-2 rounded"
            >
              Register
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto p-4">
      <h2 className="text-xl font-bold mb-4">Face Recognition</h2>
      <div className="flex flex-col items-center space-y-4">
        <Webcam
          videoRef={videoRef}
          onStreamStart={() => setIsLoading(false)}
          onStreamError={handleError}
        />
        <FaceRecognition
          videoRef={videoRef}
          onAuthenticated={handleAuthenticated}
          onError={handleError}
          email={email}
        />
        <p className="text-gray-600 mt-4 text-center">
          Please position your face within the camera view to authenticate.
        </p>
        {error && <div className="text-red-600">{error}</div>}
        <button
          onClick={resetLogin}
          className="mt-2 bg-gray-300 text-gray-800 px-4 py-2 rounded"
        >
          Use Different Email
        </button>
      </div>
    </div>
  );
};

export default Login;
