import { useState } from 'react';
import type { InterviewState, InterviewMessage, AttachedFile } from '../types/index';
import { generateInterviewAnswer } from '../services/openaiService';
import AudioControls from './AudioControls';
import FileUploadArea from './FileUploadArea';

interface InterviewChatProps {
  state: InterviewState;
  messages: InterviewMessage[];
  onAddMessage: (message: InterviewMessage) => void;
  onToggleSetup: () => void;
  isSetupOpen: boolean;
}

export default function InterviewChat({
  state,
  messages,
  onAddMessage,
  onToggleSetup,
  isSetupOpen,
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
        model: state.model || 'gpt-4o-mini',
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
    <div className="w-full bg-gradient-to-b from-gray-900 via-gray-850 to-gray-900 flex flex-col h-screen">
      {/* Header - Modern with subtle gradient */}
      <div className="border-b border-gray-700/50 px-6 py-4 flex items-center justify-between bg-gray-900/50 backdrop-blur-sm">
        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
            Interview
          </h1>
          <p className="text-gray-500 text-xs mt-1 font-medium tracking-wide">AI-powered practice</p>
        </div>
        <button
          onClick={onToggleSetup}
          className={`px-3 py-2 rounded-lg text-lg transition-all duration-200 ${
            isSetupOpen
              ? 'bg-blue-600/20 border border-blue-600/50 text-blue-400 shadow-lg shadow-blue-500/20'
              : 'bg-gray-700/20 border border-gray-600/30 hover:bg-gray-700/40 text-gray-400 hover:text-gray-300'
          }`}
          title="Toggle Setup Panel"
        >
          ⚙️
        </button>
      </div>

      {/* Chat Messages - Enhanced bubbles */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <p className="text-gray-500 text-sm font-medium mb-2">Start your interview practice</p>
              <p className="text-gray-600 text-xs">Ask a question or record your answer</p>
            </div>
          </div>
        ) : (
          messages.map((msg, idx) => (
            <div key={msg.id} className="flex gap-3 animate-fadeIn" style={{ animationDelay: `${idx * 50}ms` }}>
              {/* Avatar */}
              <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold ${
                msg.type === 'question'
                  ? 'bg-blue-600/20 border border-blue-600/50 text-blue-400'
                  : 'bg-green-600/20 border border-green-600/50 text-green-400'
              }`}>
                {msg.type === 'question' ? '👤' : '🤖'}
              </div>

              {/* Message Bubble */}
              <div className="flex-1 group">
                <div className={`rounded-lg px-4 py-3 transition-all duration-200 ${
                  msg.type === 'question'
                    ? 'bg-blue-600/10 border border-blue-600/30 hover:border-blue-600/50'
                    : 'bg-green-600/10 border border-green-600/30 hover:border-green-600/50'
                }`}>
                  <p className={`text-sm leading-relaxed ${
                    msg.type === 'question'
                      ? 'text-gray-200'
                      : 'text-gray-100'
                  }`}>
                    {msg.content}
                  </p>
                </div>
                
                {/* Timestamp */}
                <p className="text-gray-600 text-xs mt-1 px-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          ))
        )}

        {/* Generating Indicator */}
        {isGenerating && (
          <div className="flex gap-3 animate-fadeIn">
            <div className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold bg-purple-600/20 border border-purple-600/50 text-purple-400">
              🤖
            </div>
            <div className="flex-1">
              <div className="rounded-lg px-4 py-3 bg-purple-600/10 border border-purple-600/30">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    {[0, 1, 2].map((i) => (
                      <div
                        key={i}
                        className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce"
                        style={{ animationDelay: `${i * 0.1}s` }}
                      ></div>
                    ))}
                  </div>
                  <span className="text-purple-300 text-xs font-medium">Generating response...</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Error Alert - Improved */}
      {error && (
        <div className="mx-6 mb-4 p-3 bg-red-600/10 border border-red-600/30 rounded-lg text-red-300 text-sm font-medium animate-pulse">
          ⚠️ {error}
        </div>
      )}

      {/* Input Section - Modern bottom bar */}
      <div className="border-t border-gray-700/50 bg-gray-900/50 backdrop-blur-sm px-6 py-4 space-y-3">
        {/* Audio Controls */}
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

        {/* File Upload */}
        <FileUploadArea
          attachments={attachments}
          onAddAttachment={(file) => setAttachments([...attachments, file])}
          onRemoveAttachment={(fileId) =>
            setAttachments(attachments.filter((a) => a.id !== fileId))
          }
        />

        {/* Message Input - Modern */}
        <div className="space-y-2">
          <textarea
            value={manualQuestion}
            onChange={(e) => setManualQuestion(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && e.ctrlKey) {
                handleGenerateAnswer(manualQuestion, 'default');
              }
            }}
            placeholder="Type your question... (Ctrl+Enter to send)"
            className="w-full h-16 px-4 py-3 bg-gray-800/50 border border-gray-600/30 hover:border-gray-600/50 focus:border-blue-500/50 rounded-lg text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 resize-none"
          />
          
          {/* Action Buttons */}
          <div className="flex gap-2">
            <button
              onClick={() => handleGenerateAnswer(manualQuestion, 'default')}
              disabled={isGenerating || !manualQuestion.trim()}
              className="flex-1 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 disabled:from-gray-600 disabled:to-gray-700 text-white rounded-lg text-sm font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40"
            >
              {isGenerating ? '⏳ Generating...' : '✨ Generate Answer'}
            </button>
            {manualQuestion.trim() && (
              <button
                onClick={() => setManualQuestion('')}
                className="px-3 py-2.5 bg-gray-700/30 hover:bg-gray-700/50 text-gray-400 hover:text-gray-300 rounded-lg transition-all duration-200"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Answer Modification Options - Enhanced */}
        {lastAnswer && !isGenerating && (
          <div className="space-y-2 pt-2 border-t border-gray-700/50">
            <p className="text-gray-500 text-xs font-medium uppercase tracking-wider">Regenerate</p>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => handleRegenerateMode('shorter')}
                disabled={isGenerating}
                className="px-3 py-2 bg-amber-600/15 border border-amber-600/30 hover:border-amber-600/50 hover:bg-amber-600/20 disabled:opacity-50 text-amber-400 rounded-lg text-xs font-semibold transition-all duration-200"
                title="Generate shorter answer"
              >
                📉 Shorter
              </button>
              <button
                onClick={() => handleRegenerateMode('technical')}
                disabled={isGenerating}
                className="px-3 py-2 bg-cyan-600/15 border border-cyan-600/30 hover:border-cyan-600/50 hover:bg-cyan-600/20 disabled:opacity-50 text-cyan-400 rounded-lg text-xs font-semibold transition-all duration-200"
                title="Generate technical version"
              >
                ⚙️ Technical
              </button>
              <button
                onClick={() => handleRegenerateMode('natural')}
                disabled={isGenerating}
                className="px-3 py-2 bg-pink-600/15 border border-pink-600/30 hover:border-pink-600/50 hover:bg-pink-600/20 disabled:opacity-50 text-pink-400 rounded-lg text-xs font-semibold transition-all duration-200"
                title="Generate natural version"
              >
                💬 Natural
              </button>
            </div>
            <button
              onClick={copyToClipboard}
              className="w-full px-4 py-2 bg-green-600/15 border border-green-600/30 hover:border-green-600/50 hover:bg-green-600/20 text-green-400 rounded-lg text-xs font-semibold transition-all duration-200"
            >
              📋 Copy Answer
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
