import { useState, useCallback, useRef, useEffect } from 'react';

interface UseMediaRecorderReturn {
  isRecording: boolean;
  isTranscribing: boolean;
  transcript: string;
  error: string | null;
  recordingTime: number;
  startRecording: () => Promise<void>;
  stopRecording: () => Promise<void>;
  resetTranscript: () => void;
  isSupported: boolean;
}

export function useMediaRecorder(language: string): UseMediaRecorderReturn {
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const isSupported =
    typeof navigator !== 'undefined' &&
    !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);

  // Request microphone permission
  const requestPermission = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      return stream;
    } catch (err: any) {
      if (err.name === 'NotAllowedError') {
        setError('Microphone access denied. Click 🔒 next to URL and enable microphone.');
      } else if (err.name === 'NotFoundError') {
        setError('No microphone found on this device.');
      } else {
        setError(`Error accessing microphone: ${err.message}`);
      }
      throw err;
    }
  }, []);

  // Start recording
  const startRecording = useCallback(async () => {
    try {
      setError(null);
      setTranscript('');
      setRecordingTime(0);
      audioChunksRef.current = [];

      // Request permission if needed
      let stream = streamRef.current;
      if (!stream) {
        stream = await requestPermission();
      }

      // Create MediaRecorder
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      // Collect audio chunks
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onerror = (event) => {
        setError(`Recording error: ${event.error}`);
        setIsRecording(false);
      };

      mediaRecorder.start();
      setIsRecording(true);

      // Start timer
      setRecordingTime(0);
      timerIntervalRef.current = window.setInterval(() => {
        setRecordingTime((prev) => {
          const newTime = prev + 1;
          // Auto-stop at 120 seconds
          if (newTime >= 120 && mediaRecorder && mediaRecorder.state === 'recording') {
            mediaRecorder.stop();
            setIsRecording(false);
            if (timerIntervalRef.current) {
              clearInterval(timerIntervalRef.current);
            }
          }
          return newTime;
        });
      }, 1000);
    } catch (err) {
      setIsRecording(false);
      console.error('Failed to start recording:', err);
    }
  }, [requestPermission]);

  // Stop recording and transcribe
  const stopRecording = useCallback(async () => {
    return new Promise<void>((resolve) => {
      if (!mediaRecorderRef.current || mediaRecorderRef.current.state === 'inactive') {
        resolve();
        return;
      }

      // Clear timer
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }

      // Stop recording
      const mediaRecorder = mediaRecorderRef.current;
      mediaRecorder.onstop = async () => {
        setIsRecording(false);

        try {
          // Create audio blob
          const audioBlob = new Blob(audioChunksRef.current, {
            type: 'audio/webm;codecs=opus',
          });
          audioChunksRef.current = [];

          if (audioBlob.size === 0) {
            setError('No audio recorded');
            resolve();
            return;
          }

          // Transcribe with Whisper
          setIsTranscribing(true);
          setError(null);

          const formData = new FormData();
          formData.append('file', audioBlob, 'audio.webm');
          formData.append('model', 'whisper-1');
          formData.append('language', language === 'es' ? 'es' : 'en');

          // Use the same API URL as chat (dev vs prod)
          const apiUrl = import.meta.env.PROD
            ? '/api/whisper'
            : 'https://api.openai.com/v1/audio/transcriptions';

          const response = await fetch(apiUrl, {
            method: 'POST',
            body: formData,
            headers:
              import.meta.env.PROD
                ? {} // Cloudflare Function handles auth
                : {
                    Authorization: `Bearer ${
                      import.meta.env.VITE_OPENAI_API_KEY
                    }`,
                  },
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(
              errorData.error?.message || 'Transcription failed'
            );
          }

          const data = await response.json();
          setTranscript(data.text || '');
        } catch (err: any) {
          console.error('Transcription error:', err);
          setError(`Transcription error: ${err.message}`);
        } finally {
          setIsTranscribing(false);
          resolve();
        }
      };

      mediaRecorder.stop();
    });
  }, []);

  // Reset transcript
  const resetTranscript = useCallback(() => {
    setTranscript('');
    setError(null);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  return {
    isRecording,
    isTranscribing,
    transcript,
    error,
    recordingTime,
    startRecording,
    stopRecording,
    resetTranscript,
    isSupported,
  };
}
