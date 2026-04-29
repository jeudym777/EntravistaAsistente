import { useState, useCallback, useRef } from 'react';
import type { CameraContextType } from '../types/index';

export function useCamera(): Omit<CameraContextType, 'snapshot'> & { snapshot: string | null; snapshotTime?: number } {
  const [isSupported] = useState(
    () => !!(navigator.mediaDevices?.getUserMedia)
  );
  const [isEnabled, setIsEnabled] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [snapshot, setSnapshot] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const enableCamera = useCallback(async () => {
    try {
      setError(null);
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      setStream(mediaStream);
      setIsEnabled(true);

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      const errorMsg =
        err instanceof Error ? err.message : 'Failed to access camera';
      setError(errorMsg);
      setIsEnabled(false);
    }
  }, []);

  const disableCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
      setIsEnabled(false);
      setSnapshot(null);
    }
  }, [stream]);

  const captureSnapshot = useCallback(() => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0);
        const snapshotUrl = canvas.toDataURL('image/jpeg');
        setSnapshot(snapshotUrl);
      }
    }
  }, []);

  return {
    isSupported,
    isEnabled,
    stream,
    snapshot,
    enableCamera,
    disableCamera,
    captureSnapshot,
    error,
  };
}
