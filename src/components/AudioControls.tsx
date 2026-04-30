import { useEffect } from 'react';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';

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
  const languageCode = language === 'es' ? 'es-ES' : 'en-US';
  const {
    isListening,
    isSupported,
    error,
    startListening,
    stopListening,
    resetTranscript,
    transcript: speechTranscript,
    recordingTime = 0,
  } = useSpeechRecognition(languageCode) as any;

  if (speechTranscript) {
    onTranscriptChange(speechTranscript);
  }

  useEffect(() => {
    // When listening stops AND we have a transcript, trigger finalization
    if (!isListening && speechTranscript && speechTranscript.trim()) {
      const timeout = setTimeout(() => {
        onTranscriptFinalized?.();
        // Reset transcript after sending
        resetTranscript();
      }, 300);
      
      return () => clearTimeout(timeout);
    }
  }, [isListening, speechTranscript, onTranscriptFinalized, resetTranscript]);

  if (!isSupported) {
    return (
      <div className="p-4 bg-yellow-900/30 border border-yellow-700 rounded-lg text-yellow-300 text-sm">
        ⚠️ Speech Recognition not supported in your browser. Use manual input instead.
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
      {isListening && (
        <div className="flex items-center gap-3 p-3 bg-blue-900/30 border border-blue-700 rounded-lg">
          <div className="flex gap-1">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
          </div>
          <span className="text-blue-300 text-sm font-semibold">Listening...</span>
          <span className="text-blue-300 text-sm font-semibold">⏱️ {recordingTime}s / 120s</span>
        </div>
      )}

      {/* Controls */}
      <div className="flex gap-2">
        {!isListening ? (
          <button
            onClick={startListening}
            className="flex-1 px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg transition text-lg"
          >
            🎤 Start Listening
          </button>
        ) : (
          <button
            onClick={stopListening}
            className="flex-1 px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition text-lg"
          >
            ⏹️ Stop Listening
          </button>
        )}
        {speechTranscript && (
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
