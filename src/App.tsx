// src/App.tsx
import React, { useRef, useState } from "react";
import Webcam from "./components/Webcam";
import FaceRecognition from "./components/FaceRecognition";
import PasswordManager from "./components/PasswordManager";

const App: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleAuthenticated = () => {
    setIsAuthenticated(true);
  };

  const handleError = (errorMessage: string) => {
    setError(errorMessage);
  };

  return (
    <div className="container mt-20 mx-auto px-4 sm:px-6 lg:px-8">
      <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold my-8 text-center">
        Password Manager with Face Recognition
      </h1>
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
          </div>
        ) : (
          <PasswordManager />
        )}
      </div>
    </div>
  );
};

export default App;
