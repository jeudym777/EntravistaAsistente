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
      <div className="p-3 bg-yellow-600/10 border border-yellow-600/30 rounded-lg text-yellow-300 text-sm font-medium">
        ⚠️ Audio recording not supported in your browser. Use manual input instead.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {/* Permission/Error Display */}
      {error && (
        <div className="p-3 bg-red-600/10 border border-red-600/30 rounded-lg">
          <p className="text-red-300 font-semibold text-sm">🔐 Microphone Permission Needed</p>
          <p className="text-red-400/70 text-xs mt-1">
            Click 🔒 next to the URL and enable microphone access
          </p>
        </div>
      )}

      {/* Recording Status */}
      {isRecording && (
        <div className="flex items-center gap-2 p-2.5 bg-blue-600/10 border border-blue-600/30 rounded-lg">
          <div className="flex gap-1">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse"
                style={{ animationDelay: `${i * 0.15}s` }}
              ></div>
            ))}
          </div>
          <span className="text-blue-300 text-xs font-semibold">Recording • ⏱️ {recordingTime}s / 120s</span>
        </div>
      )}

      {/* Transcribing Status */}
      {isTranscribing && (
        <div className="flex items-center gap-2 p-2.5 bg-purple-600/10 border border-purple-600/30 rounded-lg">
          <div className="flex gap-1">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-pulse"
                style={{ animationDelay: `${i * 0.15}s` }}
              ></div>
            ))}
          </div>
          <span className="text-purple-300 text-xs font-semibold">Transcribing with Whisper...</span>
        </div>
      )}

      {/* Transcript Preview */}
      {transcript && !isRecording && !isTranscribing && (
        <div className="p-3 bg-green-600/10 border border-green-600/30 rounded-lg">
          <p className="text-green-400 text-xs font-semibold mb-1.5">✓ Transcript Captured</p>
          <p className="text-gray-200 text-sm leading-relaxed line-clamp-3">{transcript}</p>
        </div>
      )}

      {/* Controls - Responsive button sizing */}
      <div className="flex gap-2 items-center">
        {!isRecording && !isTranscribing ? (
          <button
            onClick={startRecording}
            className="flex-1 px-3 md:px-4 py-2.5 md:py-2 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 text-white rounded-lg text-xs md:text-sm font-semibold transition-all duration-200 shadow-lg shadow-green-500/20 hover:shadow-green-500/40"
          >
            🎤 Record
          </button>
        ) : (
          <button
            onClick={stopRecording}
            disabled={isTranscribing}
            className="flex-1 px-3 md:px-4 py-2.5 md:py-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 disabled:from-gray-600 disabled:to-gray-700 text-white rounded-lg text-xs md:text-sm font-semibold transition-all duration-200 shadow-lg shadow-red-500/20 hover:shadow-red-500/40 disabled:shadow-none disabled:opacity-50"
          >
            ⏹️ Stop Recording
          </button>
        )}
        {transcript && !isRecording && !isTranscribing && (
          <button
            onClick={resetTranscript}
            className="px-2.5 md:px-3 py-2.5 md:py-2 bg-gray-700/30 hover:bg-gray-700/50 text-gray-400 hover:text-gray-300 rounded-lg transition-all duration-200 font-medium"
            title="Clear transcript"
          >
            ✕
          </button>
        )}
      </div>
    </div>
  );
}
