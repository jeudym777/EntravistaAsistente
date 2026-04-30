import { useState } from 'react';
import type { InterviewState, InterviewMessage } from '../types/index';
import { generateInterviewAnswer } from '../services/openaiService';
import AudioControls from './AudioControls';

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
      {/* Header */}
      <div className="border-b border-gray-700 p-6">
        <h1 className="text-3xl font-bold text-white">AI Interview Copilot</h1>
        <p className="text-gray-400 text-sm mt-2">Practice interviews with AI-powered suggestions</p>
      </div>

      {/* Chat History */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-500 text-center">
              👋 Start by asking a question or enabling your microphone
            </p>
          </div>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} className="animate-fadeIn">
              {msg.type === 'question' ? (
                <div className="bg-gray-700 border-l-4 border-blue-500 p-4 rounded">
                  <p className="text-xs text-gray-400 mb-2">❓ Interviewer Question</p>
                  <p className="text-white text-base leading-relaxed">{msg.content}</p>
                </div>
              ) : (
                <div className="bg-gray-700 border-l-4 border-green-500 p-4 rounded">
                  <p className="text-xs text-gray-400 mb-2">💡 Your Suggested Answer</p>
                  <p className="text-white text-lg leading-relaxed font-medium">{msg.content}</p>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="mx-6 mb-4 p-3 bg-red-900/30 border border-red-700 rounded-lg text-red-300 text-sm">
          ❌ {error}
        </div>
      )}

      {/* Generate Indicator */}
      {isGenerating && (
        <div className="mx-6 mb-4 flex items-center gap-2 p-3 bg-purple-900/30 border border-purple-700 rounded-lg">
          <div className="flex gap-1">
            <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
            <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
          </div>
          <span className="text-purple-300 text-sm font-semibold">Generating answer...</span>
        </div>
      )}

      {/* Audio Controls */}
      <div className="border-t border-gray-700 p-6 bg-gray-800">
        <AudioControls
          language={state.language}
          onTranscriptChange={(transcript) => {
            setTranscriptToSend(transcript);
          }}
        />
      </div>

      {/* Manual Question Input */}
      <div className="border-t border-gray-700 p-6 bg-gray-800">
        <label className="block text-sm font-semibold text-gray-300 mb-2">
          Or type a question:
        </label>
        <textarea
          value={manualQuestion}
          onChange={(e) => setManualQuestion(e.target.value)}
          placeholder="Type the interviewer's question here..."
          className="w-full h-20 px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 resize-none mb-3"
        />
        <button
          onClick={() => handleGenerateAnswer(manualQuestion, 'default')}
          disabled={isGenerating}
          className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold rounded-lg transition text-lg"
        >
          ✨ Generate Answer
        </button>
      </div>

      {/* Answer Modification Buttons */}
      {lastAnswer && (
        <div className="border-t border-gray-700 p-3 bg-gray-800 space-y-2">
          <p className="text-xs text-gray-400 mb-2">Modify last answer:</p>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => handleRegenerateMode('shorter')}
              disabled={isGenerating}
              className="px-2 py-1 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white text-xs font-semibold rounded-lg transition"
            >
              📉 Shorter
            </button>
            <button
              onClick={() => handleRegenerateMode('technical')}
              disabled={isGenerating}
              className="px-2 py-1 bg-cyan-600 hover:bg-cyan-700 disabled:opacity-50 text-white text-xs font-semibold rounded-lg transition"
            >
              ⚙️ Technical
            </button>
            <button
              onClick={() => handleRegenerateMode('natural')}
              disabled={isGenerating}
              className="px-2 py-1 bg-pink-600 hover:bg-pink-700 disabled:opacity-50 text-white text-xs font-semibold rounded-lg transition"
            >
              💬 Natural
            </button>
          </div>
          <button
            onClick={copyToClipboard}
            className="w-full px-4 py-1 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-lg transition"
          >
            📋 Copy Answer
          </button>
        </div>
      )}
    </div>
  );
}
