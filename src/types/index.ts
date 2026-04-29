export interface InterviewState {
  candidateProfile: string;
  jobDescription: string;
  extraInstructions: string;
  language: 'en' | 'es';
  wordLimit: number;
}

export interface InterviewMessage {
  id: string;
  type: 'question' | 'answer';
  content: string;
  timestamp: Date;
}

export interface GenerateAnswerParams {
  candidateProfile: string;
  jobDescription: string;
  extraInstructions: string;
  language: 'en' | 'es';
  wordLimit: number;
  question: string;
  mode?: 'default' | 'shorter' | 'technical' | 'natural';
}

export interface CameraContextType {
  isSupported: boolean;
  isEnabled: boolean;
  stream: MediaStream | null;
  snapshot: string | null;
  enableCamera: () => Promise<void>;
  disableCamera: () => void;
  captureSnapshot: () => void;
  error: string | null;
}

export interface SpeechRecognitionState {
  isListening: boolean;
  transcript: string;
  isSupported: boolean;
  error: string | null;
  isFinal: boolean;
}
