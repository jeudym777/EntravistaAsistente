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
        
        setState((prev) => ({
          ...prev,
          isListening: false,
        }));
      };
    } else {
      setState((prev) => ({ ...prev, isSupported: false }));
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {
          // Ignore errors on cleanup
        }
      }
      recordingTimeRef.current = 0;
    };
  }, [language]);

  const startListening = useCallback(() => {
    if (recognitionRef.current && !state.isListening) {
      try {
        setState((prev) => ({ ...prev, transcript: '', error: null }));
        recognitionRef.current.start();
      } catch (err) {
        console.error('Error starting recognition:', err);
        setState((prev) => ({
          ...prev,
          error: 'Failed to start recording',
          isListening: false,
        }));
      }
    }
  }, [state.isListening]);

  const stopListening = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    // Set recording time to 120 to signal manual stop (prevent auto-restart)
    recordingTimeRef.current = 120;
    
    // Update state immediately
    setState((prev) => ({
      ...prev,
      isListening: false,
    }));
    
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        // Ignore errors if recognition is not active
      }
    }
  }, []);

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
