// src/App.tsx
import React, { useRef, useState } from "react";
import "./App.css";
import Webcam from "./components/Webcam/Webcam";
import FaceRecognition from "./components/FaceRecognition/FaceRecognition";
import PasswordManager from "./components/PasswordManager/PasswordManager";

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
    <div className="App">
      <h1>Password Manager with Face Recognition</h1>
      {error && <p className="error">{error}</p>}
      {!isAuthenticated ? (
        <>
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
          <p>
            Please position your face within the camera view to authenticate.
          </p>
        </>
      ) : (
        <PasswordManager />
      )}
    </div>
  );
};

export default App;
