import { useState, useCallback, useRef, useEffect } from 'react';

export interface CameraDevice {
  deviceId: string;
  label: string;
}

export function useCamera(externalVideoRef?: React.MutableRefObject<HTMLVideoElement | null>) {
  const internalVideoRef = useRef<HTMLVideoElement>(null);
  const videoRef = externalVideoRef || internalVideoRef;

  const [isSupported] = useState(
    () => !!(navigator.mediaDevices?.getUserMedia)
  );
  const [isEnabled, setIsEnabled] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [snapshot, setSnapshot] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [cameras, setCameras] = useState<CameraDevice[]>([]);
  const [selectedCameraId, setSelectedCameraId] = useState<string>('');

  // List available cameras
  const listCameras = useCallback(async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices
        .filter((device) => device.kind === 'videoinput')
        .map((device) => ({
          deviceId: device.deviceId,
          label: device.label || `Camera ${device.deviceId.slice(0, 5)}`,
        }));
      
      setCameras(videoDevices);
      if (videoDevices.length > 0 && !selectedCameraId) {
        setSelectedCameraId(videoDevices[0].deviceId);
      }
    } catch (err) {
      console.error('Failed to enumerate devices:', err);
    }
  }, [selectedCameraId]);

  // List cameras on mount
  useEffect(() => {
    listCameras();
    
    // Listen for device changes (camera connected/disconnected)
    const handleDeviceChange = () => {
      listCameras();
    };
    
    navigator.mediaDevices?.addEventListener('devicechange', handleDeviceChange);
    return () => {
      navigator.mediaDevices?.removeEventListener('devicechange', handleDeviceChange);
    };
  }, [listCameras]);

  const enableCamera = useCallback(async () => {
    try {
      setError(null);
      const constraints: MediaStreamConstraints = {
        video: {
          deviceId: selectedCameraId ? { exact: selectedCameraId } : undefined,
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      };

      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
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
  }, [selectedCameraId]);

  const disableCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
      setIsEnabled(false);
      setSnapshot(null);
    }
  }, [stream]);

  const captureSnapshot = useCallback((): string | null => {
    try {
      if (!videoRef.current) {
        console.error('Video ref not available');
        return null;
      }

      if (videoRef.current.videoWidth === 0 || videoRef.current.videoHeight === 0) {
        console.error('Video dimensions invalid:', videoRef.current.videoWidth, videoRef.current.videoHeight);
        return null;
      }

      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        console.error('Failed to get canvas context');
        return null;
      }

      ctx.drawImage(videoRef.current, 0, 0);
      const snapshotUrl = canvas.toDataURL('image/jpeg', 0.95);
      setSnapshot(snapshotUrl);
      return snapshotUrl;
    } catch (err) {
      console.error('Failed to capture snapshot:', err);
      return null;
    }
  }, []);

  const downloadSnapshot = useCallback((snapshotUrl: string) => {
    try {
      const link = document.createElement('a');
      link.href = snapshotUrl;
      link.download = `snapshot-${new Date().toISOString().replace(/[:.]/g, '-')}.jpg`;
      link.style.display = 'none';
      
      document.body.appendChild(link);
      
      // Trigger download
      setTimeout(() => {
        link.click();
        document.body.removeChild(link);
      }, 0);
    } catch (err) {
      console.error('Failed to download snapshot:', err);
    }
  }, []);

  return {
    isSupported,
    isEnabled,
    stream,
    snapshot,
    cameras,
    selectedCameraId,
    enableCamera,
    disableCamera,
    captureSnapshot,
    downloadSnapshot,
    setSelectedCameraId,
    error,
  };
}
