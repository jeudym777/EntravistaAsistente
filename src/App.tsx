import { useState } from 'react';
import type { InterviewState, InterviewMessage } from './types/index';
import InterviewSetup from './components/InterviewSetup';
import InterviewChat from './components/InterviewChat';

function App() {
  const [state, setState] = useState<InterviewState>({
    candidateProfile: '',
    jobDescription: '',
    extraInstructions: '',
    language: 'en',
    wordLimit: 120,
    model: 'gpt-4o-mini',
  });

  const [messages, setMessages] = useState<InterviewMessage[]>([]);
  const [showSetup, setShowSetup] = useState(false);

  const handleStateChange = (newState: Partial<InterviewState>) => {
    setState((prev) => ({ ...prev, ...newState }));
  };

  const handleAddMessage = (message: InterviewMessage) => {
    setMessages((prev) => [...prev, message]);
  };

  return (
    <div className="flex h-screen bg-black text-white overflow-hidden flex-col md:flex-row">
      {/* Chat Panel - Full width on mobile, flex on desktop */}
      <div className="flex-1 flex flex-col min-w-0">
        <InterviewChat
          state={state}
          messages={messages}
          onAddMessage={handleAddMessage}
          onToggleSetup={() => setShowSetup(!showSetup)}
          isSetupOpen={showSetup}
        />
      </div>
      
      {/* Setup Panel - Mobile modal or desktop sidebar */}
      {showSetup && (
        <>
          {/* Overlay backdrop - only on mobile */}
          <div
            className="fixed md:hidden inset-0 bg-black/50 z-40"
            onClick={() => setShowSetup(false)}
          />
          {/* Setup Panel - Responsive */}
          <div className="fixed md:relative right-0 top-0 md:top-auto h-screen md:h-auto w-full md:w-96 bg-black border-l border-gray-700 z-50 overflow-y-auto max-h-screen md:max-h-none">
            {/* Close button for mobile */}
            <div className="md:hidden sticky top-0 flex justify-between items-center p-3 border-b border-gray-700 bg-gray-900/80 backdrop-blur-sm z-10">
              <h2 className="text-sm font-bold text-gray-300">Configuration</h2>
              <button
                onClick={() => setShowSetup(false)}
                className="px-2 py-1 text-gray-400 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>
            <div className="p-4 md:p-6">
              <InterviewSetup state={state} onStateChange={handleStateChange} />
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default App;
