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
      <div className="p-3 bg-yellow-600/10 border border-yellow-600/30 rounded-lg text-yellow-300 text-sm font-medium">
        📷 Camera not supported in your browser
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {/* Camera Selector */}
      {cameras.length > 0 && !isEnabled && (
        <div>
          <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wide">
            Select Camera
          </label>
          <select
            value={selectedCameraId}
            onChange={(e) => setSelectedCameraId(e.target.value)}
            className="w-full px-3 py-2 bg-gray-700/40 border border-gray-600/40 hover:border-gray-600/60 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all duration-200"
          >
            {cameras.map((camera) => (
              <option key={camera.deviceId} value={camera.deviceId}>
                {camera.label}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Video Preview - Responsive */}
      <div className="rounded-lg overflow-hidden bg-gray-900/50 border border-gray-600/30 h-24 md:h-32 shadow-lg flex items-center justify-center">
        {isEnabled && stream ? (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="w-full h-full object-contain"
            style={{ transform: 'scaleX(-1)' }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-800/50">
            <p className="text-gray-500 text-xl md:text-2xl">📷</p>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-2 md:p-3 bg-red-600/10 border border-red-600/30 rounded-lg text-red-300 text-xs font-medium">
          {error}
        </div>
      )}

      {/* Snapshot Preview - Responsive */}
      {snapshot && (
        <div className="rounded-lg overflow-hidden bg-gray-900/50 border border-gray-600/30 h-20 md:h-24 shadow-md">
          <img src={snapshot} alt="Snapshot" className="w-full h-full object-cover" />
        </div>
      )}

      {/* Camera Controls - Responsive */}
      <div className="flex gap-2 pt-1">
        {!isEnabled ? (
          <button
            onClick={enableCamera}
            className="flex-1 px-2 md:px-3 py-2.5 md:py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white rounded-lg text-xs md:text-sm font-semibold transition-all duration-200 shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40"
          >
            📷 Enable Camera
          </button>
        ) : (
          <>
            <button
              onClick={handleCapture}
              className="flex-1 px-2 md:px-3 py-2.5 md:py-2 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 text-white rounded-lg text-xs md:text-sm font-semibold transition-all duration-200 shadow-lg shadow-green-500/20 hover:shadow-green-500/40"
            >
              📸 Capture
            </button>
            <button
              onClick={disableCamera}
              className="flex-1 px-2 md:px-3 py-2.5 md:py-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white rounded-lg text-xs md:text-sm font-semibold transition-all duration-200 shadow-lg shadow-red-500/20 hover:shadow-red-500/40"
            >
              Disable
            </button>
          </>
        )}
      </div>
    </div>
  );
}
