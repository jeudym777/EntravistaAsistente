export interface InterviewState {
  candidateProfile: string;
  jobDescription: string;
  extraInstructions: string;
  language: 'en' | 'es';
  wordLimit: number;
  attachments?: AttachedFile[];
}

export interface AttachedFile {
  id: string;
  name: string;
  type: string;
  size: number;
  dataUrl?: string;
  addedAt: Date;
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
  attachments?: AttachedFile[];
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
