// src/App.tsx
import React, { useRef, useEffect, useState } from "react";
import * as faceapi from "face-api.js";
import "./App.css";
import { encryptPassword, decryptPassword } from "./utils/crypto";

interface PasswordEntry {
  id: string;
  name: string;
  password: string; // Encrypted password
}

const App: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [passwords, setPasswords] = useState<PasswordEntry[]>([]);
  const [newPasswordName, setNewPasswordName] = useState<string>("");
  const [newPasswordValue, setNewPasswordValue] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  // Store labeled face descriptors
  const [labeledFaceDescriptors, setLabeledFaceDescriptors] = useState<
    faceapi.LabeledFaceDescriptors[] | null
  >(null);

  // Load models and labeled images once during initialization
  useEffect(() => {
    const loadModelsAndLabeledImages = async () => {
      const MODEL_URL = "/models";
      try {
        console.log("Loading models...");
        await faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL);
        await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
        await faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL);
        console.log("Models loaded");

        console.log("Loading labeled images...");
        const descriptors = await loadLabeledImages();
        setLabeledFaceDescriptors(descriptors);
        console.log("Labeled images loaded");

        if (videoRef.current) {
          console.log("Accessing webcam...");
          const stream = await navigator.mediaDevices.getUserMedia({
            video: {},
          });
          console.log("Webcam stream obtained");
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => {
            videoRef.current?.play();
            console.log("Webcam stream started");
            setLoading(false);
          };
        } else {
          console.error("Video reference is null");
          setError("Video element not found");
          setLoading(false);
        }
      } catch (err) {
        console.error("Error loading models or accessing webcam:", err);
        setError("Failed to load models or access webcam. Please try again.");
        setLoading(false);
      }
    };

    loadModelsAndLabeledImages();
  }, []);

  // Handle video play event
  const handleVideoPlay = async () => {
    console.log("Video play event triggered");
    if (!videoRef.current || !labeledFaceDescriptors) {
      console.error("Video reference or labeled descriptors are null");
      return;
    }

    const displaySize = { width: 720, height: 560 };
    faceapi.matchDimensions(videoRef.current, displaySize);
    console.log("Dimensions matched:", displaySize);

    try {
      const faceMatcher = new faceapi.FaceMatcher(labeledFaceDescriptors, 0.6);
      console.log("Face matcher initialized");

      const interval = setInterval(async () => {
        if (!videoRef.current) {
          console.error("Video reference lost");
          clearInterval(interval);
          return;
        }

        const detections = await faceapi
          .detectAllFaces(videoRef.current)
          .withFaceLandmarks()
          .withFaceDescriptors();

        console.log("Detections count:", detections.length);

        const resizedDetections = faceapi.resizeResults(
          detections,
          displaySize
        );

        resizedDetections.forEach((detection) => {
          const bestMatch = faceMatcher.findBestMatch(detection.descriptor);
          console.log("Best match:", bestMatch.toString());

          if (bestMatch.label === "user1") {
            // Updated label to match your image
            console.log("User authenticated");
            setIsAuthenticated(true);
            // Stop the video stream after authentication
            const stream = videoRef.current!.srcObject as MediaStream;
            stream.getTracks().forEach((track) => track.stop());
            clearInterval(interval);
          } else {
            console.log("No matching face found.");
          }
        });
      }, 500); // Reduced interval to 500ms for faster detection
    } catch (err) {
      console.error("Error during face recognition:", err);
      setError("Face recognition failed. Please try again.");
    }
  };

  // Load labeled images for face recognition once
  const loadLabeledImages = async (): Promise<
    faceapi.LabeledFaceDescriptors[]
  > => {
    const labels = ["user1"]; // Updated label to match your image

    return Promise.all(
      labels.map(async (label) => {
        try {
          const img = await faceapi.fetchImage(`/images/${label}.jpg`);
          console.log(`Fetching image for label: ${label}`);
          const detections = await faceapi
            .detectSingleFace(img)
            .withFaceLandmarks()
            .withFaceDescriptor();

          if (!detections) {
            throw new Error(`No faces detected for ${label}`);
          }

          return new faceapi.LabeledFaceDescriptors(label, [
            detections.descriptor,
          ]);
        } catch (err) {
          console.error(`Error loading labeled image for ${label}:`, err);
          throw err;
        }
      })
    );
  };

  // Attach onPlay handler directly to the video element
  useEffect(() => {
    if (isAuthenticated || loading || error || !labeledFaceDescriptors) return;

    console.log("Adding onPlay event handler");
    if (videoRef.current) {
      videoRef.current.addEventListener("play", handleVideoPlay);
    }

    return () => {
      if (videoRef.current) {
        console.log("Removing onPlay event handler");
        videoRef.current.removeEventListener("play", handleVideoPlay);
      }
    };
  }, [isAuthenticated, loading, error, labeledFaceDescriptors]);

  // Load passwords from localStorage upon successful authentication
  useEffect(() => {
    if (isAuthenticated) {
      console.log("Authentication successful");
      const storedPasswords = localStorage.getItem("passwords");
      if (storedPasswords) {
        setPasswords(JSON.parse(storedPasswords));
      }
    }
  }, [isAuthenticated]);

  // Add a new password entry
  const handleAddPassword = () => {
    if (!newPasswordName || !newPasswordValue) return;

    const encryptedPassword = encryptPassword(newPasswordValue);
    const newEntry: PasswordEntry = {
      id: Date.now().toString(),
      name: newPasswordName,
      password: encryptedPassword,
    };

    const updatedPasswords = [...passwords, newEntry];
    setPasswords(updatedPasswords);
    localStorage.setItem("passwords", JSON.stringify(updatedPasswords));

    setNewPasswordName("");
    setNewPasswordValue("");
  };

  // Delete a password entry
  const handleDeletePassword = (id: string) => {
    const updatedPasswords = passwords.filter((entry) => entry.id !== id);
    setPasswords(updatedPasswords);
    localStorage.setItem("passwords", JSON.stringify(updatedPasswords));
  };

  return (
    <div className="App">
      <h1>Password Manager with Face Recognition</h1>
      {loading && <p>Loading models and initializing webcam...</p>}
      {error && <p className="error">{error}</p>}
      <div>
        {/* Always render the video element and control its visibility */}
        <video
          ref={videoRef}
          autoPlay
          muted
          width="720"
          height="560"
          onPlay={handleVideoPlay} // Attach the event handler directly
          style={{
            display: loading || error ? "none" : "block",
          }}
        />
      </div>
      {!isAuthenticated && !loading && !error && (
        <div>
          <p>
            Please position your face within the camera view to authenticate.
          </p>
        </div>
      )}
      {isAuthenticated && (
        <div>
          <h2>Welcome!</h2>
          <div className="password-manager">
            <h3>Add New Password</h3>
            <input
              type="text"
              placeholder="Service Name"
              value={newPasswordName}
              onChange={(e) => setNewPasswordName(e.target.value)}
            />
            <input
              type="password"
              placeholder="Password"
              value={newPasswordValue}
              onChange={(e) => setNewPasswordValue(e.target.value)}
            />
            <button onClick={handleAddPassword}>Add Password</button>

            <h3>Your Passwords</h3>
            <ul>
              {passwords.map((entry) => (
                <li key={entry.id}>
                  <strong>{entry.name}:</strong>{" "}
                  {decryptPassword(entry.password)}
                  <button onClick={() => handleDeletePassword(entry.id)}>
                    Delete
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
