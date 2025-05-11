// src/components/FaceRecognition.tsx
import * as faceapi from "face-api.js";
import React, { useCallback, useEffect, useState } from "react";
import { authService } from "../services/authService";

interface FaceRecognitionProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  onAuthenticated: () => void;
  onError: (error: string) => void;
  email?: string;
}

const FaceRecognition: React.FC<FaceRecognitionProps> = ({
  videoRef,
  onAuthenticated,
  onError,
  email,
}) => {
  const [initialized, setInitialized] = useState<boolean>(false);
  const [attemptingAuth, setAttemptingAuth] = useState<boolean>(false);

  // Load models once
  useEffect(() => {
    const loadModels = async () => {
      const MODEL_URL = "/models";
      try {
        console.log("Loading Face API models...");
        await faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL);
        await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
        await faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL);
        console.log("Face API models loaded");
        setInitialized(true);
      } catch (error) {
        console.error("Error initializing Face API:", error);
        onError("Failed to initialize face recognition.");
      }
    };

    loadModels();
  }, [onError]);
  const captureAndAuthenticate = useCallback(async () => {
    if (!videoRef.current || !initialized || !email || attemptingAuth) return;

    setAttemptingAuth(true);

    try {
      const video = videoRef.current;
      const displaySize = { width: video.width, height: video.height };

      // Detect face in the video stream
      const detection = await faceapi
        .detectSingleFace(video)
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (!detection) {
        console.log(
          "No face detected. Please position yourself in the camera view."
        );
        setAttemptingAuth(false);
        return;
      }

      // Create a canvas from the video feed
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        throw new Error("Could not create canvas context");
      }

      // Draw the video frame to the canvas
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Convert canvas to blob
      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob(
          (blob) => {
            resolve(blob!);
          },
          "image/jpeg",
          0.95
        );
      });

      // Send to backend for authentication
      try {
        const user = await authService.loginWithFace(email, blob);
        console.log("User authenticated:", user);

        // Stop the video stream after authentication
        const stream = video.srcObject as MediaStream;
        stream.getTracks().forEach((track) => track.stop());

        onAuthenticated();
      } catch (error: any) {
        console.error("Authentication failed:", error);
        onError(
          error.response?.data?.message ||
            "Authentication failed. Please try again."
        );
        setAttemptingAuth(false);
      }
    } catch (error: any) {
      console.error("Error during face capture:", error);
      onError("Failed to process your face. Please try again.");
      setAttemptingAuth(false);
    }
  }, [initialized, videoRef, email, onAuthenticated, onError, attemptingAuth]);

  const handlePlay = useCallback(() => {
    if (!videoRef.current || !initialized || !email) return;

    const interval = setInterval(() => {
      if (!videoRef.current) {
        clearInterval(interval);
        return;
      }

      captureAndAuthenticate();
    }, 1500); // Check every 1.5 seconds

    return () => clearInterval(interval);
  }, [videoRef, initialized, email, captureAndAuthenticate]);

  useEffect(() => {
    if (!initialized || !videoRef.current) return;

    const video = videoRef.current;

    if (video.readyState >= 2 && !video.paused && !video.ended) {
      // Video is already playing
      const cleanup = handlePlay();
      return cleanup;
    } else {
      // Video not playing yet, wait for 'play' event
      const onVideoPlay = () => handlePlay();

      video.addEventListener("play", onVideoPlay);
      return () => {
        video.removeEventListener("play", onVideoPlay);
      };
    }
  }, [initialized, videoRef, handlePlay]);

  return null; // This component doesn't render any UI
};

export default FaceRecognition;
