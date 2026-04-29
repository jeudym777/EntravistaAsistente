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


  const handleStateChange = (newState: Partial<InterviewState>) => {
    setState((prev) => ({ ...prev, ...newState }));
  };

  const handleAddMessage = (message: InterviewMessage) => {
    setMessages((prev) => [...prev, message]);
  };

  return (
    <div className="flex h-screen bg-black text-white overflow-hidden">
      <InterviewChat
        state={state}
        messages={messages}
        onAddMessage={handleAddMessage}
      />
      <InterviewSetup state={state} onStateChange={handleStateChange} />
    </div>
  );
}

export default App;
