import { useEffect } from 'react';
import { useMediaRecorder } from '../hooks/useMediaRecorder';

interface AudioControlsProps {
  language: string;
  onTranscriptChange: (transcript: string) => void;
  onTranscriptFinalized?: () => void;
}

export default function AudioControls({
  language,
  onTranscriptChange,
  onTranscriptFinalized,
}: AudioControlsProps) {
  const {
    isRecording,
    isTranscribing,
    isSupported,
    error,
    startRecording,
    stopRecording,
    resetTranscript,
    transcript,
    recordingTime = 0,
  } = useMediaRecorder(language);

  if (transcript) {
    onTranscriptChange(transcript);
  }

  useEffect(() => {
    // When transcription finishes AND we have a transcript, trigger finalization
    if (!isRecording && !isTranscribing && transcript && transcript.trim()) {
      const timeout = setTimeout(() => {
        onTranscriptFinalized?.();
        // Reset transcript after sending
        resetTranscript();
      }, 300);
      
      return () => clearTimeout(timeout);
    }
  }, [isRecording, isTranscribing, transcript, onTranscriptFinalized, resetTranscript]);

  if (!isSupported) {
    return (
      <div className="p-4 bg-yellow-900/30 border border-yellow-700 rounded-lg text-yellow-300 text-sm">
        ⚠️ Audio recording not supported in your browser. Use manual input instead.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Permission/Error Display */}
      {error && (
        <div className="p-4 bg-red-900/50 border border-red-700 rounded-lg text-red-200 text-sm space-y-2">
          <p className="font-semibold">🔐 {error}</p>
          <p className="text-xs text-red-300">
            💡 <strong>Solución:</strong> Click en el 🔒 o 🎤 junto a la URL y permite acceso al micrófono, luego intenta nuevamente.
          </p>
        </div>
      )}

      {/* Recording Indicator */}
      {isRecording && (
        <div className="flex items-center gap-3 p-3 bg-blue-900/30 border border-blue-700 rounded-lg">
          <div className="flex gap-1">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
          </div>
          <span className="text-blue-300 text-sm font-semibold">Recording...</span>
          <span className="text-blue-300 text-sm font-semibold">⏱️ {recordingTime}s / 120s</span>
        </div>
      )}

      {/* Transcribing Indicator */}
      {isTranscribing && (
        <div className="flex items-center gap-3 p-3 bg-purple-900/30 border border-purple-700 rounded-lg">
          <div className="flex gap-1">
            <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
            <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
          </div>
          <span className="text-purple-300 text-sm font-semibold">Transcribing with Whisper...</span>
        </div>
      )}

      {/* Display captured transcript */}
      {transcript && !isRecording && !isTranscribing && (
        <div className="p-4 bg-green-900/30 border border-green-600 rounded-lg space-y-2">
          <p className="text-green-300 text-sm font-bold">📝 Captured Audio:</p>
          <div className="bg-black/50 p-3 rounded text-white text-sm leading-relaxed max-h-24 overflow-y-auto">
            {transcript}
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="flex gap-2">
        {!isRecording && !isTranscribing ? (
          <button
            onClick={startRecording}
            className="flex-1 px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg transition text-lg"
          >
            🎤 Start Recording
          </button>
        ) : (
          <button
            onClick={stopRecording}
            disabled={isTranscribing}
            className="flex-1 px-6 py-3 bg-red-600 hover:bg-red-700 disabled:bg-red-800 text-white font-bold rounded-lg transition text-lg"
          >
            ⏹️ Stop Recording
          </button>
        )}
        {transcript && !isRecording && !isTranscribing && (
          <button
            onClick={resetTranscript}
            className="px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-lg transition"
          >
            🔄 Clear
          </button>
        )}
      </div>
    </div>
  );
}
