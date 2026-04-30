import React from 'react';
import type { InterviewState } from '../types/index';
import CameraPanel from './CameraPanel';

interface InterviewSetupProps {
  state: InterviewState;
  onStateChange: (state: Partial<InterviewState>) => void;
}

export default function InterviewSetup({
  state,
  onStateChange,
}: InterviewSetupProps) {
  return (
    <div className="w-1/2 bg-black border-l border-gray-700 p-6 overflow-y-auto">
      <h2 className="text-2xl font-bold text-white mb-6">Interview Setup</h2>

      {/* Language Selector */}
      <div className="mb-6">
        <label className="block text-sm font-semibold text-gray-300 mb-2">
          Language / Idioma
        </label>
        <select
          value={state.language}
          onChange={(e) =>
            onStateChange({ language: e.target.value as 'en' | 'es' })
          }
          className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
        >
          <option value="en">English</option>
          <option value="es">Español</option>
        </select>
      </div>

      {/* Word Limit */}
      <div className="mb-6">
        <label className="block text-sm font-semibold text-gray-300 mb-2">
          Word Limit
        </label>
        <input
          type="number"
          min="50"
          max="500"
          value={state.wordLimit}
          onChange={(e) => onStateChange({ wordLimit: parseInt(e.target.value) })}
          className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
        />
        <p className="text-xs text-gray-400 mt-1">Default: 120 words</p>
      </div>

      {/* Candidate Profile */}
      <div className="mb-6">
        <label className="block text-sm font-semibold text-gray-300 mb-2">
          Candidate Profile / Perfil del Candidato
        </label>
        <textarea
          value={state.candidateProfile}
          onChange={(e) => onStateChange({ candidateProfile: e.target.value })}
          placeholder="Paste your CV, experience, skills, and relevant information here..."
          className="w-full h-32 px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 resize-none"
        />
      </div>

      {/* Job Description */}
      <div className="mb-6">
        <label className="block text-sm font-semibold text-gray-300 mb-2">
          Job Description / Descripción del Puesto
        </label>
        <textarea
          value={state.jobDescription}
          onChange={(e) => onStateChange({ jobDescription: e.target.value })}
          placeholder="Paste the job description, requirements, and responsibilities..."
          className="w-full h-32 px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 resize-none"
        />
      </div>

      {/* Extra Instructions */}
      <div className="mb-6">
        <label className="block text-sm font-semibold text-gray-300 mb-2">
          Extra Instructions / Instrucciones Adicionales
        </label>
        <textarea
          value={state.extraInstructions}
          onChange={(e) =>
            onStateChange({ extraInstructions: e.target.value })
          }
          placeholder="Any additional instructions or context for the AI assistant..."
          className="w-full h-24 px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 resize-none"
        />
      </div>

      {/* Camera Panel */}
      <CameraPanel />
    </div>
  );
}
