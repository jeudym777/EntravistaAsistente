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
    };

    const updated = presets.filter((p) => p.presetName !== presetName.trim());
    updated.push(newPreset);
    savePresetsToStorage(updated);

    setPresetName('');
    setShowForm(false);
    alert(`✅ Preset "${presetName}" saved!`);
  };

  // Load preset
  const handleLoadPreset = (preset: Preset) => {
    onStateChange({
      candidateProfile: preset.candidateProfile,
      jobDescription: preset.jobDescription,
      extraInstructions: preset.extraInstructions,
      language: preset.language,
      wordLimit: preset.wordLimit,
    });
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
      'Candidate Profile',
      'Job Description',
      'Extra Instructions',
    ];

    const rows = presets.map((p) => [
      `"${p.presetName.replace(/"/g, '""')}"`,
      `"${p.language}"`,
      `"${p.wordLimit}"`,
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
    <div className="space-y-2">
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs font-semibold text-gray-400">📋 Presets</p>
        <div className="flex gap-1">
          <button
            onClick={handleExportCSV}
            disabled={presets.length === 0}
            className="px-1.5 py-0.5 bg-green-600/20 border border-green-600/50 hover:bg-green-600/30 disabled:opacity-50 text-green-400 rounded text-xs transition"
            title="Export CSV"
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
            <span className="px-1.5 py-0.5 bg-purple-600/20 border border-purple-600/50 hover:bg-purple-600/30 text-purple-400 rounded text-xs transition inline-block">
              📤
            </span>
          </label>
        </div>
      </div>

      {/* Save Preset Form */}
      {showForm ? (
        <div className="flex gap-1">
          <input
            type="text"
            value={presetName}
            onChange={(e) => setPresetName(e.target.value)}
            placeholder="Name..."
            className="flex-1 px-2 py-1 bg-gray-700/50 border border-gray-600/50 rounded text-white text-xs focus:outline-none focus:border-gray-500"
            onKeyPress={(e) => e.key === 'Enter' && handleSavePreset()}
          />
          <button
            onClick={handleSavePreset}
            className="px-2 py-1 bg-green-600/20 border border-green-600/50 hover:bg-green-600/30 text-green-400 rounded text-xs transition"
          >
            ✓
          </button>
          <button
            onClick={() => {
              setShowForm(false);
              setPresetName('');
            }}
            className="px-2 py-1 bg-gray-700/30 hover:bg-gray-700/50 text-gray-400 rounded text-xs transition"
          >
            ✕
          </button>
        </div>
      ) : (
        <button
          onClick={() => setShowForm(true)}
          className="w-full px-2 py-1 bg-blue-600/20 border border-blue-600/50 hover:bg-blue-600/30 text-blue-400 rounded text-xs font-medium transition"
        >
          💾 Save
        </button>
      )}

      {/* Presets List - Compact */}
      {presets.length > 0 && (
        <div className="space-y-1 max-h-24 overflow-y-auto">
          {presets.map((preset) => (
            <div
              key={preset.presetName}
              className="flex items-center gap-1 p-1 bg-gray-700/20 border border-gray-600/30 rounded text-xs group hover:bg-gray-700/30 transition"
            >
              <button
                onClick={() => handleLoadPreset(preset)}
                className="flex-1 text-left px-1.5 py-0.5 text-gray-300 hover:text-blue-400 truncate"
                title={preset.presetName}
              >
                {preset.presetName}
              </button>
              <button
                onClick={() => handleDeletePreset(preset.presetName)}
                className="px-1 py-0.5 text-gray-500 hover:text-red-400 transition opacity-0 group-hover:opacity-100"
              >
                ✕
              </button>
            </div>
          ))}
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
    if (row.values && row.values.length >= 6) {
      const language = (row.values[1] || 'en').toLowerCase() === 'es' ? 'es' : 'en';
      const preset: Preset = {
        presetName: row.values[0]?.trim() || 'Unnamed',
        language,
        wordLimit: parseInt(row.values[2] || '120', 10) || 120,
        candidateProfile: row.values[3]?.trim() || '',
        jobDescription: row.values[4]?.trim() || '',
        extraInstructions: row.values[5]?.trim() || '',
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
