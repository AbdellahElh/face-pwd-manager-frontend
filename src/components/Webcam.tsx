// src/components/Webcam.tsx
import React, { useEffect } from "react";

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
    <div className="flex justify-center items-center">
      <video ref={videoRef} autoPlay muted className="w-[720px] h-[560px]" />
    </div>
  );
};

export default Webcam;
