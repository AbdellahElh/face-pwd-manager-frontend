// src/components/FaceRecognition.tsx
import * as faceapi from "face-api.js";
import React, { useCallback, useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";

interface FaceRecognitionProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  onAuthenticated: () => void;
  onError: (error: string) => void;
}

const FaceRecognition: React.FC<FaceRecognitionProps> = ({
  videoRef,
  onAuthenticated,
  onError,
}) => {
  const { user, login } = useAuth();
  const email = user?.email;
  const [initialized, setInitialized] = useState(false);
  const [attemptingAuth, setAttemptingAuth] = useState(false);

  useEffect(() => {
    const loadModels = async () => {
      try {
        const MODEL_URL = "/models";
        await faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL);
        setInitialized(true);
      } catch (err) {
        console.error("Face API init error:", err);
        onError("Failed to initialize face detection.");
      }
    };
    loadModels();
  }, [onError]);

  const captureAndAuthenticate = useCallback(async () => {
    const video = videoRef.current;
    if (!video || !initialized || !email || attemptingAuth) return;
    setAttemptingAuth(true);
    try {
      const detection = await faceapi.detectSingleFace(video);
      if (!detection) {
        setAttemptingAuth(false);
        return;
      }
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas context error");
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
          (b) => (b ? resolve(b) : reject(new Error("Blob failed"))),
          "image/jpeg",
          0.95
        );
      });
      // use context login
      await login(email, blob);
      const stream = video.srcObject as MediaStream;
      stream.getTracks().forEach((t) => t.stop());
      onAuthenticated();
    } catch (err: any) {
      console.error("Auth error:", err);
      onError(err.message || "Authentication failed. Please try again.");
      setAttemptingAuth(false);
    }
  }, [initialized, videoRef, email, login, onAuthenticated, onError, attemptingAuth]);

  useEffect(() => {
    if (!initialized || !videoRef.current) return;
    const video = videoRef.current;
    let interval: number;
    const start = () => (interval = window.setInterval(captureAndAuthenticate, 1000));
    if (video.readyState >= 2 && !video.paused) start();
    else video.addEventListener("play", start);
    return () => {
      clearInterval(interval);
      video.removeEventListener("play", start);
    };
  }, [initialized, videoRef, captureAndAuthenticate]);

  return null;
};

export default FaceRecognition;