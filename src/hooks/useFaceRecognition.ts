// src/hooks/useFaceRecognition.ts
import { useCallback } from "react";
import * as faceapi from "face-api.js";

interface UseFaceRecognition {
  initializeFaceAPI: (modelUrl: string) => Promise<void>;
  recognizeFace: (
    video: HTMLVideoElement,
    faceMatcher: faceapi.FaceMatcher,
    onAuthenticated: () => void,
    onError: (error: string) => void
  ) => void;
}

const useFaceRecognition = (): UseFaceRecognition => {
  const initializeFaceAPI = useCallback(async (modelUrl: string) => {
    await faceapi.nets.ssdMobilenetv1.loadFromUri(modelUrl);
    await faceapi.nets.faceLandmark68Net.loadFromUri(modelUrl);
    await faceapi.nets.faceRecognitionNet.loadFromUri(modelUrl);
  }, []);

  const recognizeFace = useCallback(
    (
      video: HTMLVideoElement,
      faceMatcher: faceapi.FaceMatcher,
      onAuthenticated: () => void,
      onError: (error: string) => void
    ) => {
      const displaySize = { width: 720, height: 560 };
      faceapi.matchDimensions(video, displaySize);

      const interval = setInterval(async () => {
        try {
          const detections = await faceapi
            .detectAllFaces(video)
            .withFaceLandmarks()
            .withFaceDescriptors();

          const resizedDetections = faceapi.resizeResults(
            detections,
            displaySize
          );

          resizedDetections.forEach((detection) => {
            const bestMatch = faceMatcher.findBestMatch(detection.descriptor);
            console.log("Best match:", bestMatch.toString());

            if (bestMatch.label === "user1") {
              console.log("User authenticated");
              onAuthenticated();
              // Stop the video stream after authentication
              const stream = video.srcObject as MediaStream;
              stream.getTracks().forEach((track) => track.stop());
              clearInterval(interval);
            } else {
              console.log("No matching face found.");
            }
          });
        } catch (error) {
          console.error("Error during face recognition:", error);
          onError("Face recognition failed. Please try again.");
          clearInterval(interval);
        }
      }, 500); // 500ms interval
    },
    []
  );

  return { initializeFaceAPI, recognizeFace };
};

export default useFaceRecognition;
