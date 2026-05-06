import { useState } from 'react';
import type { InterviewState, InterviewMessage } from './types/index';
import InterviewSetup from './components/InterviewSetup';
import InterviewChat from './components/InterviewChat';
import CameraCapturePage from './components/CameraCapturePage';

type PageView = 'interview' | 'camera';

function App() {
  const [currentPage, setCurrentPage] = useState<PageView>('interview');
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

  if (currentPage === 'camera') {
    return (
      <div className="relative">
        <CameraCapturePage />
        {/* Floating Navigation Button */}
        <button
          onClick={() => setCurrentPage('interview')}
          className="fixed top-4 left-4 z-50 flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-gray-900 to-black border border-gray-700 text-white text-sm font-semibold rounded-lg hover:border-blue-600/50 transition-all hover:shadow-lg hover:shadow-blue-500/20"
        >
          ← Volver
        </button>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-black text-white overflow-hidden flex-col md:flex-row">
      {/* Navigation Header - Camera Access */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-40">
        <button
          onClick={() => setCurrentPage('camera')}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white text-sm font-semibold rounded-lg transition-all shadow-lg hover:shadow-blue-500/50 active:scale-95"
        >
          📷 Captura
        </button>
      </div>

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
