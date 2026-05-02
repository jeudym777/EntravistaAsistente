import { useState, useEffect } from 'react';
import type { InterviewState } from '../types/index';

interface Preset extends InterviewState {
  presetName: string;
}

interface PresetManagerProps {
  state: InterviewState;
  onStateChange: (state: Partial<InterviewState>) => void;
}

const PRESETS_STORAGE_KEY = 'interview_presets';

export default function PresetManager({
  state,
  onStateChange,
}: PresetManagerProps) {
  const [presets, setPresets] = useState<Preset[]>([]);
  const [presetName, setPresetName] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingPresetName, setEditingPresetName] = useState<string | null>(null);

  // Load presets from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(PRESETS_STORAGE_KEY);
    if (stored) {
      try {
        setPresets(JSON.parse(stored));
      } catch (e) {
        console.error('Failed to parse presets:', e);
      }
    }
  }, []);

  // Save presets to localStorage
  const savePresetsToStorage = (newPresets: Preset[]) => {
    localStorage.setItem(PRESETS_STORAGE_KEY, JSON.stringify(newPresets));
    setPresets(newPresets);
  };

  // Create new preset from current state
  const handleSavePreset = () => {
    if (!presetName.trim()) {
      alert('Please enter a preset name');
      return;
    }

    const newPreset: Preset = {
      presetName: presetName.trim(),
      candidateProfile: state.candidateProfile || '',
      jobDescription: state.jobDescription || '',
      extraInstructions: state.extraInstructions || '',
      language: state.language || 'en',
      wordLimit: state.wordLimit || 120,
      model: state.model || 'gpt-4o-mini',
    };

    const updated = presets.filter((p) => p.presetName !== presetName.trim());
    updated.push(newPreset);
    savePresetsToStorage(updated);

    setPresetName('');
    setShowForm(false);
    alert(`✅ Preset "${presetName}" saved!`);
  };

  // Load preset and mark as editing
  const handleLoadPreset = (preset: Preset) => {
    onStateChange({
      candidateProfile: preset.candidateProfile,
      jobDescription: preset.jobDescription,
      extraInstructions: preset.extraInstructions,
      language: preset.language,
      wordLimit: preset.wordLimit,
      model: preset.model || 'gpt-4o-mini',
    });
    setEditingPresetName(preset.presetName);
  };

  // Update current editing preset
  const handleUpdatePreset = () => {
    if (!editingPresetName) return;

    const updatedPreset: Preset = {
      presetName: editingPresetName,
      candidateProfile: state.candidateProfile || '',
      jobDescription: state.jobDescription || '',
      extraInstructions: state.extraInstructions || '',
      language: state.language || 'en',
      wordLimit: state.wordLimit || 120,
      model: state.model || 'gpt-4o-mini',
    };

    const updated = presets.map((p) =>
      p.presetName === editingPresetName ? updatedPreset : p
    );
    savePresetsToStorage(updated);
    alert(`✅ Preset "${editingPresetName}" updated!`);
    setEditingPresetName(null);
  };

  // Delete preset
  const handleDeletePreset = (name: string) => {
    if (confirm(`Delete preset "${name}"?`)) {
      const updated = presets.filter((p) => p.presetName !== name);
      savePresetsToStorage(updated);
    }
  };

  // Export presets to CSV
  const handleExportCSV = () => {
    if (presets.length === 0) {
      alert('No presets to export');
      return;
    }

    const headers = [
      'Preset Name',
      'Language',
      'Word Limit',
      'Model',
      'Candidate Profile',
      'Job Description',
      'Extra Instructions',
    ];

    const rows = presets.map((p) => [
      `"${p.presetName.replace(/"/g, '""')}"`,
      `"${p.language}"`,
      `"${p.wordLimit}"`,
      `"${p.model || 'gpt-4o-mini'}"`,
      `"${(p.candidateProfile || '').replace(/"/g, '""')}"`,
      `"${(p.jobDescription || '').replace(/"/g, '""')}"`,
      `"${(p.extraInstructions || '').replace(/"/g, '""')}"`,
    ]);

    const csv = [headers.map((h) => `"${h}"`).join(','), ...rows.map((r) => r.join(','))].join(
      '\n'
    );

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', `interview-presets-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    alert('✅ Presets exported to CSV');
  };

  // Import presets from CSV
  const handleImportCSV = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const csv = e.target?.result as string;
        const importedPresets = parseCSV(csv);

        if (importedPresets.length === 0) {
          alert('No valid presets found in CSV');
          return;
        }

        // Merge with existing, replacing duplicates by name
        const merged = presets.filter(
          (p) => !importedPresets.some((ip) => ip.presetName === p.presetName)
        );
        savePresetsToStorage([...merged, ...importedPresets]);

        alert(`✅ Imported ${importedPresets.length} preset(s)`);
      } catch (error) {
        alert(`❌ Error importing CSV: ${error}`);
      }
    };

    reader.readAsText(file);
    event.target.value = '';
  };

  return (
    <div className="space-y-2 md:space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">🎯 Presets</p>
        <div className="flex gap-1 md:gap-1.5">
          <button
            onClick={handleExportCSV}
            disabled={presets.length === 0}
            className="p-1.5 md:p-2 bg-green-600/15 border border-green-600/40 hover:border-green-600/60 hover:bg-green-600/20 disabled:opacity-40 disabled:cursor-not-allowed text-green-400 rounded-lg text-xs md:text-sm transition-all duration-200"
            title="Export presets as CSV"
          >
            📥
          </button>
          <label className="cursor-pointer">
            <input
              type="file"
              accept=".csv"
              onChange={handleImportCSV}
              className="hidden"
            />
            <span className="p-1.5 md:p-2 bg-purple-600/15 border border-purple-600/40 hover:border-purple-600/60 hover:bg-purple-600/20 text-purple-400 rounded-lg text-xs md:text-sm transition-all duration-200 inline-block">
              📤
            </span>
          </label>
        </div>
      </div>

      {/* Edit or Save Form */}
      {editingPresetName ? (
        <div className="p-3 bg-yellow-600/10 border border-yellow-600/30 rounded-lg space-y-2">
          <p className="text-yellow-300 text-xs font-semibold">✏️ Editing: <span className="font-bold">{editingPresetName}</span></p>
          <div className="flex gap-2">
            <button
              onClick={handleUpdatePreset}
              className="flex-1 px-3 py-2 bg-gradient-to-r from-yellow-600 to-yellow-700 hover:from-yellow-500 hover:to-yellow-600 text-white rounded-lg text-xs font-semibold transition-all duration-200"
            >
              💾 Update
            </button>
            <button
              onClick={() => setEditingPresetName(null)}
              className="px-3 py-2 bg-gray-700/30 hover:bg-gray-700/50 text-gray-400 rounded-lg transition-all duration-200"
            >
              ✕
            </button>
          </div>
        </div>
      ) : showForm ? (
        <div className="flex gap-2">
          <input
            type="text"
            value={presetName}
            onChange={(e) => setPresetName(e.target.value)}
            placeholder="Preset name..."
            className="flex-1 px-3 py-2 bg-gray-700/40 border border-gray-600/40 hover:border-gray-600/60 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all duration-200"
            onKeyPress={(e) => e.key === 'Enter' && handleSavePreset()}
            autoFocus
          />
          <button
            onClick={handleSavePreset}
            className="px-3 py-2 bg-green-600/20 border border-green-600/50 hover:bg-green-600/30 text-green-400 rounded-lg text-sm font-semibold transition-all duration-200"
          >
            ✓
          </button>
          <button
            onClick={() => {
              setShowForm(false);
              setPresetName('');
            }}
            className="px-3 py-2 bg-gray-700/30 hover:bg-gray-700/50 text-gray-400 rounded-lg transition-all duration-200"
          >
            ✕
          </button>
        </div>
      ) : (
        <button
          onClick={() => setShowForm(true)}
          className="w-full px-3 py-2 bg-blue-600/15 border border-blue-600/40 hover:border-blue-600/60 hover:bg-blue-600/20 text-blue-400 rounded-lg text-sm font-semibold transition-all duration-200"
        >
          💾 Save Current Config
        </button>
      )}

      {/* Presets List */}
      {presets.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-xs text-gray-500 font-medium">Saved presets:</p>
          <div className="space-y-1 max-h-48 overflow-y-auto">
            {presets.map((preset) => (
              <div
                key={preset.presetName}
                className={`flex items-center gap-2 p-2 rounded-lg text-xs transition-all duration-200 group cursor-pointer ${
                  editingPresetName === preset.presetName
                    ? 'bg-yellow-600/15 border border-yellow-600/40'
                    : 'bg-gray-700/20 border border-gray-600/30 hover:border-gray-600/60 hover:bg-gray-700/30'
                }`}
              >
                <button
                  onClick={() => handleLoadPreset(preset)}
                  className={`flex-1 text-left px-2 py-1 truncate font-medium transition-colors duration-200 ${
                    editingPresetName === preset.presetName
                      ? 'text-yellow-300'
                      : 'text-gray-300 hover:text-blue-400'
                  }`}
                  title={preset.presetName}
                >
                  {preset.presetName}
                </button>
                <button
                  onClick={() => handleDeletePreset(preset.presetName)}
                  className={`px-2 py-1 text-gray-500 hover:text-red-400 transition-all duration-200 opacity-0 group-hover:opacity-100 ${
                    editingPresetName === preset.presetName ? 'opacity-100' : ''
                  }`}
                  title="Delete preset"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Robust CSV parser that handles multiline fields and quoted values
function parseCSV(csvText: string): Preset[] {
  const lines = csvText.split('\n');
  
  if (lines.length < 2) return [];

  // Skip header
  const dataLines = lines.slice(1);
  const presets: Preset[] = [];
  let i = 0;

  while (i < dataLines.length) {
    const row = parseCSVRow(dataLines, i);
    if (row.values && row.values.length >= 7) {
      const language = (row.values[1] || 'en').toLowerCase() === 'es' ? 'es' : 'en';
      const model = ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo'].includes(row.values[3]?.trim() || '')
        ? (row.values[3]?.trim() as 'gpt-4o' | 'gpt-4o-mini' | 'gpt-4-turbo')
        : 'gpt-4o-mini';
      
      const preset: Preset = {
        presetName: row.values[0]?.trim() || 'Unnamed',
        language,
        wordLimit: parseInt(row.values[2] || '120', 10) || 120,
        model,
        candidateProfile: row.values[4]?.trim() || '',
        jobDescription: row.values[5]?.trim() || '',
        extraInstructions: row.values[6]?.trim() || '',
      };
      
      // Only add if has a name
      if (preset.presetName && preset.presetName !== 'Unnamed') {
        presets.push(preset);
      }
    }
    i = row.nextLine;
  }

  return presets;
}

// Parse a single CSV row, handling multiline quoted fields
function parseCSVRow(
  lines: string[],
  startLine: number
): { values: string[]; nextLine: number } {
  let row = '';
  let line = startLine;
  let inQuotes = false;

  while (line < lines.length) {
    const currentLine = lines[line];
    
    if (!currentLine) {
      line++;
      continue;
    }

    row += (row ? '\n' : '') + currentLine;

    // Check if we have unclosed quotes
    for (let i = 0; i < currentLine.length; i++) {
      if (currentLine[i] === '"' && (i === 0 || currentLine[i - 1] !== '\\')) {
        if (inQuotes && currentLine[i + 1] === '"') {
          i++; // Skip escaped quote
        } else {
          inQuotes = !inQuotes;
        }
      }
    }

    line++;

    // If quotes are closed, we have a complete row
    if (!inQuotes) break;
  }

  const values = parseCSVLine(row);
  return { values, nextLine: line };
}

// Parse a CSV line into fields
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        current += '"';
        i++; // Skip next quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(stripQuotes(current.trim()));
      current = '';
    } else {
      current += char;
    }
  }

  result.push(stripQuotes(current.trim()));
  return result;
}

// Remove surrounding quotes from a string
function stripQuotes(str: string): string {
  if (str.startsWith('"') && str.endsWith('"')) {
    return str.slice(1, -1).replace(/""/g, '"');
  }
  return str;
}
