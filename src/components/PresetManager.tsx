import { useState } from 'react';
import { presetsService, type PresetConfig } from '../services/presetsService';
import type { InterviewState } from '../types/index';

interface PresetManagerProps {
  state: InterviewState;
  onStateChange: (state: Partial<InterviewState>) => void;
}

export default function PresetManager({
  state,
  onStateChange,
}: PresetManagerProps) {
  const [presets, setPresets] = useState<PresetConfig[]>(
    presetsService.getAllPresets()
  );
  const [presetName, setPresetName] = useState('');
  const [showSaveForm, setShowSaveForm] = useState(false);

  const handleSavePreset = () => {
    if (!presetName.trim()) {
      alert('Please enter a preset name');
      return;
    }

    presetsService.savePreset({
      name: presetName,
      candidateProfile: state.candidateProfile,
      jobDescription: state.jobDescription,
      extraInstructions: state.extraInstructions,
      language: state.language,
      wordLimit: state.wordLimit,
    });

    setPresets(presetsService.getAllPresets());
    setPresetName('');
    setShowSaveForm(false);
  };

  const handleLoadPreset = (presetName: string) => {
    const preset = presetsService.loadPreset(presetName);
    if (preset) {
      onStateChange({
        candidateProfile: preset.candidateProfile,
        jobDescription: preset.jobDescription,
        extraInstructions: preset.extraInstructions,
        language: preset.language as 'en' | 'es',
        wordLimit: preset.wordLimit,
      });
    }
  };

  const handleDeletePreset = (presetName: string) => {
    if (confirm(`Delete preset "${presetName}"?`)) {
      presetsService.deletePreset(presetName);
      setPresets(presetsService.getAllPresets());
    }
  };

  const handleImportCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const csv = event.target?.result as string;
        presetsService.importFromCSV(csv);
        setPresets(presetsService.getAllPresets());
        alert('Presets imported successfully!');
      } catch (err) {
        alert('Error importing CSV: ' + (err instanceof Error ? err.message : 'Unknown error'));
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="bg-gray-900 border border-gray-700 rounded-lg p-4 mb-6">
      <h3 className="text-lg font-semibold text-white mb-4">📋 Presets Manager</h3>

      {/* Load Preset Dropdown */}
      {presets.length > 0 && (
        <div className="mb-4">
          <label className="block text-xs font-semibold text-gray-300 mb-2">
            Load Saved Preset:
          </label>
          <select
            onChange={(e) => {
              if (e.target.value) {
                handleLoadPreset(e.target.value);
                e.target.value = '';
              }
            }}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500"
            defaultValue=""
          >
            <option value="">-- Select a preset --</option>
            {presets.map((preset) => (
              <option key={preset.name} value={preset.name}>
                {preset.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Save New Preset */}
      <div className="mb-4">
        {!showSaveForm ? (
          <button
            onClick={() => setShowSaveForm(true)}
            className="w-full px-3 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-lg transition"
          >
            💾 Save Current Config as Preset
          </button>
        ) : (
          <div className="space-y-2">
            <input
              type="text"
              value={presetName}
              onChange={(e) => setPresetName(e.target.value)}
              placeholder="Enter preset name (e.g., 'Tech Role - Backend')..."
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-500 text-sm focus:outline-none focus:border-green-500"
            />
            <div className="flex gap-2">
              <button
                onClick={handleSavePreset}
                className="flex-1 px-3 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-lg transition"
              >
                ✓ Save
              </button>
              <button
                onClick={() => {
                  setShowSaveForm(false);
                  setPresetName('');
                }}
                className="flex-1 px-3 py-2 bg-gray-600 hover:bg-gray-700 text-white text-sm font-semibold rounded-lg transition"
              >
                ✕ Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Saved Presets List */}
      {presets.length > 0 && (
        <div className="mb-4 max-h-32 overflow-y-auto">
          <p className="text-xs font-semibold text-gray-300 mb-2">Saved Presets:</p>
          <div className="space-y-1">
            {presets.map((preset) => (
              <div
                key={preset.name}
                className="flex items-center justify-between bg-gray-800 p-2 rounded text-xs"
              >
                <span className="text-gray-300 truncate">{preset.name}</span>
                <button
                  onClick={() => handleDeletePreset(preset.name)}
                  className="px-2 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-xs transition"
                >
                  🗑️
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Export & Import */}
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={() => presetsService.downloadCSV()}
          className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition"
        >
          📥 Export CSV
        </button>
        <label className="px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold rounded-lg transition cursor-pointer text-center">
          📤 Import CSV
          <input
            type="file"
            accept=".csv"
            onChange={handleImportCSV}
            className="hidden"
          />
        </label>
      </div>
    </div>
  );
}
