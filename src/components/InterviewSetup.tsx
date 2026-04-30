import { useEffect, useState } from 'react';
import type { InterviewState } from '../types/index';
import CameraPanel from './CameraPanel';
import PresetManager from './PresetManager';

const DEFAULT_CANDIDATE_PROFILE = `YEUDI MARTÍNEZ SÁNCHEZ
Computer Engineer
San Carlos, Alajuela, Ciudad Quesada, Costa Rica
+506 8702 5190 | yeudimartinez2025@gmail.com | https://yeoolabs.com/

EDUCATION
Instituto Tecnológico de Costa Rica (TEC)
Bachelor of Computer Engineering 2017 — 2025
ITCR & MYONGJI COLLEGE SOUTH KOREA (2025)
Certificate Medical image processing with deep learning (nov 2025)

EXPERIENCE & PROJECTS
Online Store Mundo Movil JR (Sep 2025 – Dec 2025)
Stack: React, SQL Server, Role: Full Stack Developer. Cloudflare Hosting.

Employee Management System CRM (Nov 2025 - Dec 2025)
Built scalable frontend with Angular, REST APIs, and structured state management.

Security AI Modules (Feb 2025 – July 2025)
Built real-time computer vision pipelines. Stack: Python, FaceNet, YOLOv8

Medical Patient & Clinical Records (Feb 2023 – Nov 2024)
Full-stack application using React and SQL Server with ML integration.

TECHNICAL SKILLS
Programming: Java, C#, Python, C++, JavaScript, TypeScript
Web: HTML5, CSS3, React, Next.js, TailwindCSS, Angular
Databases: SQL Server, PostgreSQL, Supabase
AI/ML: Deep Learning, FaceNet, YOLOv8, Computer Vision, PyTorch
Tools: Unity 3D, .NET, Firebase, Azure, Cloudflare, Blender, GitHub Copilot

LANGUAGES: Spanish – Native / English – Proficient`;

const DEFAULT_JOB_DESCRIPTION = `Computer Vision & Applied ML Engineer at First Factory

About the Role:
Own parts of an end-to-end pipeline from raw video through training, evaluation, and production inference. Train and iterate on computer vision models for objects, geometry, and human motion in healthcare workflows.

Key Responsibilities:
- Own end-to-end ML pipeline from data through inference
- Train and iterate on computer vision models
- Curate and annotate video data, define evaluation protocols
- Design and maintain structured representations of system observations
- Work with AWS SageMaker and Bedrock for training and hosting
- Partner with hardware, backend, and product teams
- Contribute to model governance for healthcare compliance

Requirements:
- 3+ years of hands-on computer vision and applied ML with Python
- PyTorch expertise for training and fine-tuning deep models
- Practical video ML experience (frame sampling, temporal aggregation)
- AWS experience including SageMaker and Bedrock
- Full ML lifecycle understanding: versioning, experiment tracking, evaluation
- LangChain and LangGraph expertise for building LLM applications
- Clear English communication with distributed teams

Nice to Have:
- JSON-centric ML interfaces design
- Time-series or event-sequence thinking
- Human action recognition and anomaly detection
- Healthcare/regulated environments experience (HIPAA)
- Annotation tooling knowledge (CVAT, Label Studio, Roboflow)`;

interface InterviewSetupProps {
  state: InterviewState;
  onStateChange: (state: Partial<InterviewState>) => void;
}

export default function InterviewSetup({
  state,
  onStateChange,
}: InterviewSetupProps) {
  const [isInitialized, setIsInitialized] = useState(false);

  // Load default data on first mount
  useEffect(() => {
    if (!isInitialized && !state.candidateProfile) {
      onStateChange({
        candidateProfile: DEFAULT_CANDIDATE_PROFILE,
        jobDescription: DEFAULT_JOB_DESCRIPTION,
      });
      setIsInitialized(true);
    }
  }, [isInitialized, state.candidateProfile, onStateChange]);

  return (
    <div className="w-1/2 bg-black border-l border-gray-700 p-6 overflow-y-auto">
      <h2 className="text-2xl font-bold text-white mb-6">Interview Setup</h2>

      {/* Presets Manager */}
      <PresetManager state={state} onStateChange={onStateChange} />

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
