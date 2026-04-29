import React, { useEffect, useRef } from 'react';
import { useCamera } from '../hooks/useCamera';

export default function CameraPanel() {
  const { isSupported, isEnabled, stream, snapshot, enableCamera, disableCamera, captureSnapshot, error } =
    useCamera();
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  if (!isSupported) {
    return (
      <div className="mt-8 p-4 bg-gray-800 rounded-lg border border-gray-700">
        <p className="text-sm text-gray-400">
          📷 Camera not supported in your browser
        </p>
      </div>
    );
  }

  return (
    <div className="mt-8">
      <h3 className="text-lg font-semibold text-white mb-4">
        Optional: Camera / Cámara
      </h3>

      {/* Video Preview */}
      <div className="mb-4 rounded-lg overflow-hidden bg-gray-800 border border-gray-700">
        {isEnabled && stream ? (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="w-full h-48 object-cover"
          />
        ) : (
          <div className="w-full h-48 flex items-center justify-center bg-gray-700">
            <p className="text-gray-400">📷 Camera preview</p>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-3 bg-red-900/30 border border-red-700 rounded-lg text-red-300 text-sm">
          {error}
        </div>
      )}

      {/* Snapshot Preview */}
      {snapshot && (
        <div className="mb-4 rounded-lg overflow-hidden bg-gray-800 border border-gray-700">
          <img src={snapshot} alt="Snapshot" className="w-full h-auto" />
        </div>
      )}

      {/* Camera Controls */}
      <div className="flex gap-2">
        {!isEnabled ? (
          <button
            onClick={enableCamera}
            className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition"
          >
            📷 Enable Camera
          </button>
        ) : (
          <>
            <button
              onClick={captureSnapshot}
              className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition"
            >
              📸 Capture Snapshot
            </button>
            <button
              onClick={disableCamera}
              className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition"
            >
              ❌ Disable Camera
            </button>
          </>
        )}
      </div>
    </div>
  );
}
