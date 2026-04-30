import { useState, useCallback, useRef, useEffect } from 'react';
import type { SpeechRecognitionState } from '../types/index';

interface ExtendedSpeechRecognitionState extends SpeechRecognitionState {
  recordingTime: number;
}

export function useSpeechRecognition(language: string = 'en-US') {
  const [state, setState] = useState<ExtendedSpeechRecognitionState>({
    isListening: false,
    transcript: '',
    isSupported: true,
    error: null,
    isFinal: false,
    recordingTime: 0,
  });

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startListening = useCallback(async () => {
    try {
      // Request microphone permission
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm',
      });
      audioChunksRef.current = [];

      mediaRecorder.onstart = () => {
        setState({
          isListening: true,
          transcript: '',
          error: null,
          isFinal: false,
          recordingTime: 0,
          isSupported: true,
        });

        timerRef.current = setInterval(() => {
          setState((prev) => {
            const newTime = prev.recordingTime + 1;
            if (newTime >= 120) {
              mediaRecorder.stop();
              return prev;
            }
            return { ...prev, recordingTime: newTime };
          });
        }, 1000);
      };

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        if (timerRef.current) clearInterval(timerRef.current);

        // Stop all tracks
        streamRef.current?.getTracks().forEach((track) => track.stop());

        // Create blob from audio chunks
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });

        if (audioBlob.size > 0) {
          try {
            // Send to OpenAI Whisper API
            const formData = new FormData();
            formData.append('file', audioBlob, 'audio.webm');
            formData.append('model', 'whisper-1');
            formData.append('language', language === 'es-ES' ? 'es' : 'en');

            const apiUrl = import.meta.env.PROD
              ? '/api/whisper'
              : 'https://api.openai.com/v1/audio/transcriptions';

            const response = await fetch(apiUrl, {
              method: 'POST',
              body: formData,
              headers: {
                Authorization: `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`,
              },
            });

            if (!response.ok) {
              throw new Error(`Whisper API error: ${response.statusText}`);
            }

            const data = await response.json();
            setState((prev) => ({
              ...prev,
              transcript: data.text || '',
              isListening: false,
              isFinal: true,
            }));
          } catch (error: any) {
            console.error('Whisper error:', error);
            setState((prev) => ({
              ...prev,
              error: `Transcription error: ${error.message}`,
              isListening: false,
            }));
          }
        } else {
          setState((prev) => ({ ...prev, isListening: false }));
        }
      };

      mediaRecorder.onerror = (event: any) => {
        if (timerRef.current) clearInterval(timerRef.current);
        streamRef.current?.getTracks().forEach((track) => track.stop());
        setState({
          isListening: false,
          transcript: '',
          recordingTime: 0,
          error: `Recording error: ${event.error}`,
          isFinal: false,
          isSupported: true,
        });
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
    } catch (error: any) {
      if (error.name === 'NotAllowedError') {
        setState((prev) => ({
          ...prev,
          error: 'Microphone permission denied. Click 🔒 or 🎤 next to URL and enable microphone',
          isListening: false,
        }));
      } else if (error.name === 'NotFoundError') {
        setState((prev) => ({
          ...prev,
          error: 'No microphone found',
          isListening: false,
        }));
      } else {
        setState((prev) => ({
          ...prev,
          error: `Error: ${error.message}`,
          isListening: false,
        }));
      }
    }
  }, [language]);

  const stopListening = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    setState((prev) => ({ ...prev, isListening: false }));
  }, []);

  const resetTranscript = useCallback(() => {
    setState((prev) => ({
      ...prev,
      transcript: '',
      error: null,
      isFinal: false,
      recordingTime: 0,
    }));
    audioChunksRef.current = [];
  }, []);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      streamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  return {
    ...state,
    startListening,
    stopListening,
    resetTranscript,
  };
}
