// src/components/Webcam/Webcam.tsx
import React, { useEffect } from "react";
import "./Webcam.css";

interface WebcamProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  onStreamStart?: () => void;
  onStreamError?: (error: string) => void;
}

const Webcam: React.FC<WebcamProps> = ({
  videoRef,
  onStreamStart,
  onStreamError,
}) => {
  useEffect(() => {
    const startWebcam = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => {
            videoRef.current?.play();
            if (onStreamStart) onStreamStart();
          };
        }
      } catch (error) {
        console.error("Error accessing webcam:", error);
        if (onStreamError) onStreamError("Failed to access webcam.");
      }
    };

    startWebcam();
  }, [videoRef, onStreamStart, onStreamError]);

  return (
    <div className="webcam-container">
      <video ref={videoRef} autoPlay muted width="720" height="560" />
    </div>
  );
};

export default Webcam;
