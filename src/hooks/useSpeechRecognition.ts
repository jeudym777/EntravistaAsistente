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
  const interimTranscriptRef = useRef<string>('');

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
        interimTranscriptRef.current = '';
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
              try {
                recognitionRef.current.stop();
              } catch (e) {
                // ignore
              }
            }
          }
        }, 1000);
      };

      recognition.onresult = (event: any) => {
        let interimTranscript = '';
        
        // Capture both interim and final results
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          
          if (event.results[i].isFinal) {
            setState((prev) => ({
              ...prev,
              transcript: (prev.transcript + ' ' + transcript).trim(),
              isFinal: true,
            }));
          } else {
            interimTranscript += transcript;
          }
        }
        
        interimTranscriptRef.current = interimTranscript;
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
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {
          // ignore
        }
      }
    };
  }, [language]);

  const startListening = useCallback(() => {
    if (!recognitionRef.current) return;
    
    setState((prev) => ({ ...prev, transcript: '', error: null }));
    interimTranscriptRef.current = '';
    
    // Request microphone permission first
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then(() => {
        // Permission granted, start listening
        try {
          recognitionRef.current.start();
        } catch (err) {
          console.error('Error starting recognition:', err);
          setState((prev) => ({
            ...prev,
            error: 'Failed to start recording',
            isListening: false,
          }));
        }
      })
      .catch((err) => {
        // Permission denied or error
        if (err.name === 'NotAllowedError') {
          setState((prev) => ({
            ...prev,
            error: 'Microphone permission denied. Enable in browser settings.',
            isListening: false,
          }));
        } else if (err.name === 'NotFoundError') {
          setState((prev) => ({
            ...prev,
            error: 'No microphone found.',
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
  }, []);

  const stopListening = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        console.error('Error stopping recognition:', e);
      }
    }
    
    // Force state update immediately
    setState((prev) => ({
      ...prev,
      isListening: false,
    }));
  }, []);

  const resetTranscript = useCallback(() => {
    setState((prev) => ({
      ...prev,
      transcript: '',
      error: null,
      isFinal: false,
    }));
    interimTranscriptRef.current = '';
  }, []);

  return {
    ...state,
    startListening,
    stopListening,
    resetTranscript,
  };
}
