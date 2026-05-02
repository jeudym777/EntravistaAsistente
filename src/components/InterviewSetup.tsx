import { useEffect } from 'react';
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

const DEFAULT_EXTRA_INSTRUCTIONS = `Use simple, professional English at a B1-B2 level, but include correct technical vocabulary when needed.

Main strengths to highlight:
- Applied computer vision in real-world environments.
- Python-based AI systems with real-time camera processing.
- Experience with YOLOv8, Faster R-CNN, ResNet, FaceNet, OpenCV, PyTorch, ONNX, PyQt, and vector databases like Weaviate.
- Experience building complete AI pipelines: data collection, dataset preparation, training, testing, evaluation, UI integration, and real-time inference.
- Security AI modules: person detection, facial recognition, anti-spoofing, and weapon detection.
- Practical work with IP/USB cameras, lighting variation, false positives, inference time, FPS, and resource optimization.
- Ability to transform raw detections into useful system states, alerts, events, or structured outputs.
- Full-stack background with React, Next.js, Angular, SQL Server, PostgreSQL, Supabase, APIs, and Cloudflare.
- Strong initiative, fast learning, problem solving, creativity, and ability to build real products independently.

When answering technical questions, use this structure:
1. Direct answer
2. Related real experience from Yeudi
3. Technical detail, trade-off, or design decision
4. Short closing connected to the role

Keep answers clear, practical, confident but humble, and focused on impact. Target 90-170 words depending on question complexity.`;

interface InterviewSetupProps {
  state: InterviewState;
  onStateChange: (state: Partial<InterviewState>) => void;
}

export default function InterviewSetup({
  state,
  onStateChange,
}: InterviewSetupProps) {
  useEffect(() => {
    if (!state.candidateProfile || state.candidateProfile.trim() === '') {
      onStateChange({ candidateProfile: DEFAULT_CANDIDATE_PROFILE });
    }
    if (!state.jobDescription || state.jobDescription.trim() === '') {
      onStateChange({ jobDescription: DEFAULT_JOB_DESCRIPTION });
    }
    if (!state.extraInstructions || state.extraInstructions.trim() === '') {
      onStateChange({ extraInstructions: DEFAULT_EXTRA_INSTRUCTIONS });
    }
  }, []);
  return (
    <div className="p-6 space-y-6 bg-gradient-to-b from-gray-900 to-gray-900/80">
      <h2 className="text-xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
        Configuration
      </h2>

      {/* Language Selector */}
      <div>
        <label className="block text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wide">
          🌐 Language
        </label>
        <select
          value={state.language}
          onChange={(e) =>
            onStateChange({ language: e.target.value as 'en' | 'es' })
          }
          className="w-full px-3 py-2 bg-gray-700/40 border border-gray-600/40 hover:border-gray-600/60 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all duration-200"
        >
          <option value="en">🇺🇸 English</option>
          <option value="es">🇪🇸 Español</option>
        </select>
      </div>

      {/* Word Limit */}
      <div>
        <label className="block text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wide">
          📝 Word Limit
        </label>
        <input
          type="number"
          min="50"
          max="500"
          value={state.wordLimit}
          onChange={(e) => onStateChange({ wordLimit: parseInt(e.target.value) })}
          className="w-full px-3 py-2 bg-gray-700/40 border border-gray-600/40 hover:border-gray-600/60 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all duration-200"
        />
        <p className="text-xs text-gray-500 mt-1">Target: {state.wordLimit} words per answer</p>
      </div>

      {/* Preset Manager */}
      <div className="border-t border-gray-700/50 pt-4">
        <PresetManager state={state} onStateChange={onStateChange} />
      </div>

      {/* Candidate Profile */}
      <div>
        <label className="block text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wide">
          👤 Candidate Profile
        </label>
        <textarea
          value={state.candidateProfile}
          onChange={(e) => onStateChange({ candidateProfile: e.target.value })}
          placeholder="Your CV, skills, experience, education, projects..."
          className="w-full h-24 px-3 py-2 bg-gray-700/40 border border-gray-600/40 hover:border-gray-600/60 rounded-lg text-white placeholder-gray-500/70 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all duration-200 resize-none"
        />
      </div>

      {/* Job Description */}
      <div>
        <label className="block text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wide">
          💼 Job Description
        </label>
        <textarea
          value={state.jobDescription}
          onChange={(e) => onStateChange({ jobDescription: e.target.value })}
          placeholder="Position details, responsibilities, requirements..."
          className="w-full h-24 px-3 py-2 bg-gray-700/40 border border-gray-600/40 hover:border-gray-600/60 rounded-lg text-white placeholder-gray-500/70 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all duration-200 resize-none"
        />
      </div>

      {/* Extra Instructions */}
      <div>
        <label className="block text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wide">
          ⚡ Extra Instructions
        </label>
        <textarea
          value={state.extraInstructions}
          onChange={(e) =>
            onStateChange({ extraInstructions: e.target.value })
          }
          placeholder="Interview tips, tone, language level, format preferences..."
          className="w-full h-20 px-3 py-2 bg-gray-700/40 border border-gray-600/40 hover:border-gray-600/60 rounded-lg text-white placeholder-gray-500/70 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all duration-200 resize-none"
        />
      </div>

      {/* Camera Panel */}
      <div className="border-t border-gray-700/50 pt-4">
        <p className="text-xs font-semibold text-gray-400 mb-3 uppercase tracking-wide">📷 Optional: Camera</p>
        <CameraPanel />
      </div>
    </div>
  );
}
