import { useEffect, useRef } from 'react';
import { useCamera } from '../hooks/useCamera';

export default function CameraPanel() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const {
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
  } = useCamera(videoRef);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  const handleCapture = () => {
    try {
      const snapshotUrl = captureSnapshot();
      if (snapshotUrl) {
        downloadSnapshot(snapshotUrl);
      } else {
        alert('Failed to capture snapshot. Make sure camera is enabled and has video.');
      }
    } catch (err) {
      console.error('Capture error:', err);
      alert('Error capturing snapshot');
    }
  };

  if (!isSupported) {
    return (
      <div className="mt-4 p-2 bg-yellow-900/20 border border-yellow-700/50 rounded text-yellow-300 text-xs">
        📷 Camera not supported
      </div>
    );
  }

  return (
    <div className="mt-4 space-y-2">
      {/* Camera Selector */}
      {cameras.length > 0 && !isEnabled && (
        <select
          value={selectedCameraId}
          onChange={(e) => setSelectedCameraId(e.target.value)}
          className="w-full px-2 py-1.5 bg-gray-700/50 border border-gray-600/50 rounded text-white text-xs focus:outline-none focus:border-gray-500"
        >
          {cameras.map((camera) => (
            <option key={camera.deviceId} value={camera.deviceId}>
              {camera.label}
            </option>
          ))}
        </select>
      )}

      {/* Video Preview */}
      <div className="rounded overflow-hidden bg-gray-700/30 border border-gray-600/50 h-28">
        {isEnabled && stream ? (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-700/30">
            <p className="text-gray-500 text-xs">📷</p>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-2 bg-red-900/20 border border-red-700/50 rounded text-red-400 text-xs">
          {error}
        </div>
      )}

      {/* Snapshot Preview */}
      {snapshot && (
        <div className="rounded overflow-hidden border border-gray-600/50 h-20">
          <img src={snapshot} alt="Snapshot" className="w-full h-full object-cover" />
        </div>
      )}

      {/* Camera Controls - Compact */}
      <div className="flex gap-1">
        {!isEnabled ? (
          <button
            onClick={enableCamera}
            className="flex-1 px-2 py-1.5 bg-blue-600/20 border border-blue-600/50 hover:bg-blue-600/30 text-blue-400 rounded text-xs font-medium transition"
          >
            📷 Enable
          </button>
        ) : (
          <>
            <button
              onClick={handleCapture}
              className="flex-1 px-2 py-1.5 bg-green-600/20 border border-green-600/50 hover:bg-green-600/30 text-green-400 rounded text-xs font-medium transition"
            >
              📸 Capture
            </button>
            <button
              onClick={disableCamera}
              className="flex-1 px-2 py-1.5 bg-red-600/20 border border-red-600/50 hover:bg-red-600/30 text-red-400 rounded text-xs font-medium transition"
            >
              Disable
            </button>
          </>
        )}
      </div>
    </div>
  );
}
