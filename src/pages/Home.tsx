import React, { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import FaceRecognition from "../components/FaceRecognition";
import PasswordManager from "../components/PasswordManager";
import Webcam from "../components/Webcam";

const Home: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleAuthenticated = () => {
    setIsAuthenticated(true);
  };

  const handleError = (errorMessage: string) => {
    setError(errorMessage);
  };

  return (
    <div className="flex flex-col items-center p-4">
      {error && (
        <p className="text-red-500 mb-4 text-sm sm:text-base text-center">
          {error}
        </p>
      )}
      {!isAuthenticated ? (
        <div className="flex flex-col items-center space-y-4 sm:space-y-6">
          <Webcam
            videoRef={videoRef}
            onStreamStart={() => {}}
            onStreamError={handleError}
          />
          <FaceRecognition
            videoRef={videoRef}
            onAuthenticated={handleAuthenticated}
            onError={handleError}
          />
          <p className="text-gray-200 mt-4 text-xs sm:text-sm md:text-base text-center">
            Please position your face within the camera view to authenticate.
          </p>
          <button
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded"
            onClick={() => navigate("/register")}
          >
            Register
          </button>
        </div>
      ) : (
        <PasswordManager />
      )}
    </div>
  );
};

export default Home;
