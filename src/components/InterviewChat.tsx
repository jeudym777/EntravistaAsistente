import { useState } from 'react';
import type { InterviewState, InterviewMessage, AttachedFile } from '../types/index';
import { generateInterviewAnswer } from '../services/openaiService';
import AudioControls from './AudioControls';
import FileUploadArea from './FileUploadArea';

interface InterviewChatProps {
  state: InterviewState;
  messages: InterviewMessage[];
  onAddMessage: (message: InterviewMessage) => void;
}

export default function InterviewChat({
  state,
  messages,
  onAddMessage,
}: InterviewChatProps) {
  const [manualQuestion, setManualQuestion] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [transcriptToSend, setTranscriptToSend] = useState('');
  const [attachments, setAttachments] = useState<AttachedFile[]>([]);

  const lastAnswer = messages.filter((m) => m.type === 'answer').pop();

  const handleGenerateAnswer = async (
    question: string = '',
    mode: 'default' | 'shorter' | 'technical' | 'natural' = 'default'
  ) => {
    const questionToUse = question || manualQuestion || transcriptToSend;

    if (!questionToUse.trim()) {
      setError('Please provide a question first');
      return;
    }

    if (!state.candidateProfile || !state.jobDescription) {
      setError(
        'Please fill in both Candidate Profile and Job Description in the setup'
      );
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      // Add question message if not already there
      if (!manualQuestion && transcriptToSend) {
        const questionId = 'q-' + Date.now();
        onAddMessage({
          id: questionId,
          type: 'question',
          content: transcriptToSend,
          timestamp: new Date(),
        });
        setTranscriptToSend('');
      }

      const answer = await generateInterviewAnswer({
        candidateProfile: state.candidateProfile,
        jobDescription: state.jobDescription,
        extraInstructions: state.extraInstructions,
        language: state.language,
        wordLimit: state.wordLimit,
        question: questionToUse,
        mode,
        attachments: attachments.length > 0 ? attachments : undefined,
      });

      const answerId = 'a-' + Date.now();
      onAddMessage({
        id: answerId,
        type: 'answer',
        content: answer,
        timestamp: new Date(),
      });

      setManualQuestion('');
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMsg);
      console.error('Error generating answer:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = async () => {
    if (lastAnswer) {
      try {
        await navigator.clipboard.writeText(lastAnswer.content);
        alert('Answer copied to clipboard!');
      } catch (err) {
        console.error('Failed to copy:', err);
      }
    }
  };

  const handleRegenerateMode = (mode: 'shorter' | 'technical' | 'natural') => {
    if (lastAnswer) {
      handleGenerateAnswer(lastAnswer.content, mode);
    }
  };

  return (
    <div className="w-1/2 bg-gray-800 flex flex-col h-screen">
      {/* Header - Minimal */}
      <div className="border-b border-gray-700 p-4">
        <h1 className="text-2xl font-semibold text-white">Interview</h1>
        <p className="text-gray-400 text-xs mt-1">AI-powered practice</p>
      </div>

      {/* Chat History */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-500 text-sm text-center">
              Start by asking a question
            </p>
          </div>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} className="animate-fadeIn">
              {msg.type === 'question' ? (
                <div className="bg-gray-700/30 border-l-2 border-blue-500/50 p-3 rounded text-sm">
                  <p className="text-gray-400 text-xs mb-1">❓</p>
                  <p className="text-gray-200">{msg.content}</p>
                </div>
              ) : (
                <div className="bg-gray-700/30 border-l-2 border-green-500/50 p-3 rounded text-sm">
                  <p className="text-gray-400 text-xs mb-1">💡</p>
                  <p className="text-gray-100 leading-relaxed">{msg.content}</p>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Error Display - Compact */}
      {error && (
        <div className="mx-4 mb-2 p-2 bg-red-900/20 border border-red-700/50 rounded text-red-300 text-xs">
          {error}
        </div>
      )}

      {/* Generate Indicator - Compact */}
      {isGenerating && (
        <div className="mx-4 mb-2 flex items-center gap-1 p-2 bg-purple-900/20 border border-purple-700/50 rounded">
          <div className="flex gap-0.5">
            <div className="w-1 h-1 bg-purple-500 rounded-full animate-pulse"></div>
            <div className="w-1 h-1 bg-purple-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-1 h-1 bg-purple-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
          </div>
          <span className="text-purple-400 text-xs font-medium">Generating...</span>
        </div>
      )}

      {/* Bottom Section - Compact */}
      <div className="border-t border-gray-700 bg-gray-800 space-y-2 p-4">
        {/* Audio Controls */}
        <div>
          <AudioControls
            language={state.language}
            onTranscriptChange={(transcript) => {
              setTranscriptToSend(transcript);
            }}
            onTranscriptFinalized={() => {
              if (transcriptToSend.trim()) {
                setManualQuestion(transcriptToSend);
              }
            }}
          />
        </div>

        {/* File Upload */}
        <div>
          <FileUploadArea
            attachments={attachments}
            onAddAttachment={(file) => setAttachments([...attachments, file])}
            onRemoveAttachment={(fileId) =>
              setAttachments(attachments.filter((a) => a.id !== fileId))
            }
          />
        </div>

        {/* Manual Question Input - Compact */}
        <div className="space-y-1">
          <textarea
            value={manualQuestion}
            onChange={(e) => setManualQuestion(e.target.value)}
            placeholder="Type question..."
            className="w-full h-16 px-3 py-2 bg-gray-700/50 border border-gray-600/50 rounded text-white placeholder-gray-500 text-sm focus:outline-none focus:border-gray-500 resize-none"
          />
          <div className="flex gap-2">
            <button
              onClick={() => handleGenerateAnswer(manualQuestion, 'default')}
              disabled={isGenerating || !manualQuestion.trim()}
              className="flex-1 px-3 py-2 bg-blue-600/20 border border-blue-600/50 hover:bg-blue-600/30 disabled:opacity-50 text-blue-400 rounded text-sm font-medium transition"
            >
              ✨ Generate
            </button>
            {manualQuestion.trim() && (
              <button
                onClick={() => setManualQuestion('')}
                className="px-2 py-2 bg-gray-700/30 hover:bg-gray-700/50 text-gray-400 rounded transition"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Answer Modification Buttons - Compact */}
        {lastAnswer && (
          <div className="space-y-1 pt-1 border-t border-gray-700">
            <div className="grid grid-cols-3 gap-1">
              <button
                onClick={() => handleRegenerateMode('shorter')}
                disabled={isGenerating}
                className="px-2 py-1 bg-amber-600/20 border border-amber-600/50 hover:bg-amber-600/30 disabled:opacity-50 text-amber-400 rounded text-xs font-medium transition"
                title="Shorter"
              >
                📉
              </button>
              <button
                onClick={() => handleRegenerateMode('technical')}
                disabled={isGenerating}
                className="px-2 py-1 bg-cyan-600/20 border border-cyan-600/50 hover:bg-cyan-600/30 disabled:opacity-50 text-cyan-400 rounded text-xs font-medium transition"
                title="Technical"
              >
                ⚙️
              </button>
              <button
                onClick={() => handleRegenerateMode('natural')}
                disabled={isGenerating}
                className="px-2 py-1 bg-pink-600/20 border border-pink-600/50 hover:bg-pink-600/30 disabled:opacity-50 text-pink-400 rounded text-xs font-medium transition"
                title="Natural"
              >
                💬
              </button>
            </div>
            <button
              onClick={copyToClipboard}
              className="w-full px-2 py-1 bg-green-600/20 border border-green-600/50 hover:bg-green-600/30 text-green-400 rounded text-xs font-medium transition"
            >
              📋 Copy
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
