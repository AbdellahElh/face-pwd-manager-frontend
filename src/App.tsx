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
    <>
      <h1 className="text-3xl font-bold my-18">
        Password Manager with Face Recognition
      </h1>
      <div className="flex flex-col items-center p-4">
        {error && <p className="text-red-500 mb-4">{error}</p>}
        {!isAuthenticated ? (
          <div className="flex flex-col items-center">
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
            <p className="text-gray-200 mt-4">
              Please position your face within the camera view to authenticate.
            </p>
          </div>
        ) : (
          <PasswordManager />
        )}
      </div>
    </>
  );
};

export default App;
