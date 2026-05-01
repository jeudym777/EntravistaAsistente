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
    <div className="space-y-3">
      {/* Permission/Error Display */}
      {error && (
        <div className="p-3 bg-red-900/20 border border-red-700/50 rounded text-red-400 text-xs">
          <p className="font-medium">🔐 {error}</p>
          <p className="text-red-400/70 mt-1">
            💡 Click 🔒 next to URL and enable microphone
          </p>
        </div>
      )}

      {/* Recording Status Compact */}
      {isRecording && (
        <div className="flex items-center gap-2 p-2 bg-blue-900/20 border border-blue-700/50 rounded text-sm">
          <div className="flex gap-1">
            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></div>
            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
          </div>
          <span className="text-blue-400 text-xs font-medium">Recording • ⏱️ {recordingTime}s</span>
        </div>
      )}

      {/* Transcribing Status */}
      {isTranscribing && (
        <div className="flex items-center gap-2 p-2 bg-purple-900/20 border border-purple-700/50 rounded text-sm">
          <div className="flex gap-1">
            <div className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-pulse"></div>
            <div className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
          </div>
          <span className="text-purple-400 text-xs font-medium">Transcribing...</span>
        </div>
      )}

      {/* Transcript Preview */}
      {transcript && !isRecording && !isTranscribing && (
        <div className="p-3 bg-green-900/20 border border-green-700/50 rounded text-sm">
          <p className="text-green-400 text-xs font-semibold mb-1">✓ Captured</p>
          <p className="text-gray-300 text-xs leading-relaxed">{transcript}</p>
        </div>
      )}

      {/* Controls - Compact */}
      <div className="flex gap-2 items-center">
        {!isRecording && !isTranscribing ? (
          <button
            onClick={startRecording}
            className="flex-1 px-3 py-2 bg-green-600/20 border border-green-600/50 hover:bg-green-600/30 text-green-400 rounded text-sm font-medium transition"
          >
            🎤 Record
          </button>
        ) : (
          <button
            onClick={stopRecording}
            disabled={isTranscribing}
            className="flex-1 px-3 py-2 bg-red-600/20 border border-red-600/50 hover:bg-red-600/30 disabled:opacity-50 text-red-400 rounded text-sm font-medium transition"
          >
            ⏹️ Stop
          </button>
        )}
        {transcript && !isRecording && !isTranscribing && (
          <button
            onClick={resetTranscript}
            className="px-2 py-2 bg-gray-700/30 hover:bg-gray-700/50 text-gray-400 rounded transition"
            title="Clear"
          >
            ✕
          </button>
        )}
      </div>
    </div>
  );
}
