import { useState, useCallback, useRef, useEffect } from 'react';
import type { SpeechRecognitionState } from '../types/index';

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

interface ExtendedSpeechRecognitionState extends SpeechRecognitionState {
  recordingTime: number;
}

export function useSpeechRecognition(language: string = 'en-US') {
  const [state, setState] = useState<ExtendedSpeechRecognitionState>({
    isListening: false,
    transcript: '',
    isSupported: false,
    error: null,
    isFinal: false,
    recordingTime: 0,
  });

  const recognitionRef = useRef<any>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const recordingTimeRef = useRef<number>(0);

  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (SpeechRecognition) {
      setState((prev) => ({ ...prev, isSupported: true }));
      recognitionRef.current = new SpeechRecognition();
      const recognition = recognitionRef.current;

      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = language;

      recognition.onstart = () => {
        recordingTimeRef.current = 0;
        setState((prev) => ({
          ...prev,
          isListening: true,
          error: null,
          transcript: '',
          isFinal: false,
          recordingTime: 0,
        }));

        // Start timer - update every second and stop at 120 seconds
        timerRef.current = setInterval(() => {
          recordingTimeRef.current += 1;
          setState((prev) => ({
            ...prev,
            recordingTime: recordingTimeRef.current,
          }));

          // Stop recording after 120 seconds
          if (recordingTimeRef.current >= 120) {
            if (recognitionRef.current) {
              recognitionRef.current.stop();
            }
          }
        }, 1000);
      };

      recognition.onresult = (event: any) => {
        // Only capture final results to avoid showing intermediate transcriptions
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            const transcript = event.results[i][0].transcript;
            setState((prev) => ({
              ...prev,
              transcript: (prev.transcript + ' ' + transcript).trim(),
              isFinal: true,
            }));
          }
        }
      };

      recognition.onerror = (event: any) => {
        if (timerRef.current) {
          clearInterval(timerRef.current);
        }
        setState((prev) => ({
          ...prev,
          error: event.error,
          isListening: false,
        }));
      };

      recognition.onend = () => {
        if (timerRef.current) {
          clearInterval(timerRef.current);
        }
        
        // If recording time is less than 120 seconds and user didn't manually stop,
        // restart recording to keep it going
        if (recordingTimeRef.current < 120) {
          try {
            recognitionRef.current.start();
          } catch (e) {
            // Recognition is already started, ignore error
          }
        } else {
          // 120 seconds reached, stop listening
          setState((prev) => ({
            ...prev,
            isListening: false,
          }));
        }
      };
    } else {
      setState((prev) => ({ ...prev, isSupported: false }));
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, [language]);

  const startListening = useCallback(() => {
    if (recognitionRef.current && !state.isListening) {
      setState((prev) => ({ ...prev, transcript: '', error: null }));
      
      // Request microphone permission first
      navigator.mediaDevices.getUserMedia({ audio: true })
        .then(() => {
          // Permission granted, start listening
          recognitionRef.current.start();
        })
        .catch((err) => {
          // Permission denied or error
          if (err.name === 'NotAllowedError') {
            setState((prev) => ({
              ...prev,
              error: 'Microphone permission denied. Please enable microphone access in browser settings.',
              isListening: false,
            }));
          } else if (err.name === 'NotFoundError') {
            setState((prev) => ({
              ...prev,
              error: 'No microphone found. Please connect a microphone and try again.',
              isListening: false,
            }));
          } else {
            setState((prev) => ({
              ...prev,
              error: `Microphone error: ${err.message}`,
              isListening: false,
            }));
          }
        });
    }
  }, [state.isListening]);

  const stopListening = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    // Set recording time to 120 to signal manual stop (prevent auto-restart)
    recordingTimeRef.current = 120;
    if (recognitionRef.current && state.isListening) {
      recognitionRef.current.stop();
    }
  }, [state.isListening]);

  const resetTranscript = useCallback(() => {
    setState((prev) => ({
      ...prev,
      transcript: '',
      error: null,
      isFinal: false,
    }));
  }, []);

  return {
    ...state,
    startListening,
    stopListening,
    resetTranscript,
  };
}
