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
    <div className="flex h-screen bg-black text-white overflow-hidden">
      {/* Chat Panel - Full width or left side */}
      <InterviewChat
        state={state}
        messages={messages}
        onAddMessage={handleAddMessage}
        onToggleSetup={() => setShowSetup(!showSetup)}
        isSetupOpen={showSetup}
      />
      
      {/* Setup Panel - Sandwich menu that slides in from right */}
      {showSetup && (
        <>
          {/* Overlay backdrop */}
          <div
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setShowSetup(false)}
          />
          {/* Setup Panel */}
          <div className="fixed right-0 top-0 h-screen w-96 bg-black border-l border-gray-700 z-50 overflow-y-auto">
            <InterviewSetup state={state} onStateChange={handleStateChange} />
          </div>
        </>
      )}
    </div>
  );
}

export default App;
