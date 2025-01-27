// src/components/FaceRecognition.tsx
import React, { useEffect, useState, useCallback } from "react";
import * as faceapi from "face-api.js";

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
  const [faceMatcher, setFaceMatcher] = useState<faceapi.FaceMatcher | null>(
    null
  );
  const [initialized, setInitialized] = useState<boolean>(false);

  // Load models and descriptors once
  useEffect(() => {
    const loadModelsAndDescriptors = async () => {
      const MODEL_URL = "/models";
      try {
        console.log("Loading Face API models...");
        await faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL);
        await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
        await faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL);
        console.log("Face API models loaded");

        console.log("Loading labeled images...");
        const labeledDescriptors = await loadLabeledImages();
        const matcher = new faceapi.FaceMatcher(labeledDescriptors, 0.6);
        setFaceMatcher(matcher);
        setInitialized(true);
        console.log("Labeled images loaded and FaceMatcher initialized");
      } catch (error) {
        console.error("Error initializing Face API:", error);
        onError("Failed to initialize face recognition.");
      }
    };

    loadModelsAndDescriptors();
  }, [onError]);

  // Load labeled images
  const loadLabeledImages = async (): Promise<
    faceapi.LabeledFaceDescriptors[]
  > => {
    const labels = ["user1"]; // adjust label as needed

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
            throw new Error(`No faces detected for label ${label}`);
          }

          return new faceapi.LabeledFaceDescriptors(label, [
            detections.descriptor,
          ]);
        } catch (error) {
          console.error(`Error loading labeled image for ${label}:`, error);
          onError(`Failed to load labeled image for ${label}.`);
          throw error;
        }
      })
    );
  };

  const handlePlay = useCallback(() => {
    if (!videoRef.current || !faceMatcher) return;

    const displaySize = { width: 720, height: 560 };
    faceapi.matchDimensions(videoRef.current, displaySize);

    const interval = setInterval(async () => {
      if (!videoRef.current) {
        clearInterval(interval);
        return;
      }

      const detections = await faceapi
        .detectAllFaces(videoRef.current)
        .withFaceLandmarks()
        .withFaceDescriptors();

      const resizedDetections = faceapi.resizeResults(detections, displaySize);

      resizedDetections.forEach((detection) => {
        const bestMatch = faceMatcher.findBestMatch(detection.descriptor);
        console.log("Best match:", bestMatch.toString());

        if (bestMatch.label === "user1") {
          console.log("User authenticated");
          onAuthenticated();
          // Stop the video stream after authentication
          const stream = videoRef.current!.srcObject as MediaStream;
          stream.getTracks().forEach((track) => track.stop());
          clearInterval(interval);
        } else {
          console.log("No matching face found.");
        }
      });
    }, 500); // Check every 500ms
  }, [faceMatcher, onAuthenticated, onError, videoRef]);

  useEffect(() => {
    if (!initialized || !faceMatcher || !videoRef.current) return;

    // If the video is already playing, call handlePlay directly
    // Check readyState or paused property:
    const video = videoRef.current;
    if (video.readyState >= 2 && !video.paused && !video.ended) {
      // Video is already playing
      handlePlay();
    } else {
      // Video not playing yet, wait for 'play' event
      const onVideoPlay = () => handlePlay();

      video.addEventListener("play", onVideoPlay);
      return () => {
        video.removeEventListener("play", onVideoPlay);
      };
    }
  }, [initialized, faceMatcher, videoRef, handlePlay]);

  return null; // This component doesn't render any UI
};

export default FaceRecognition;
