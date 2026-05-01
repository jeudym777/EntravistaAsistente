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
    <div className="space-y-4 bg-gray-900/50 p-4 rounded-lg border border-gray-700">
      <h3 className="text-lg font-bold text-white">📋 Presets</h3>

      {/* Save New Preset */}
      <div className="space-y-3">
        {showForm ? (
          <div className="flex gap-2">
            <input
              type="text"
              value={presetName}
              onChange={(e) => setPresetName(e.target.value)}
              placeholder="Preset name (e.g., Senior Backend Engineer)"
              className="flex-1 px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white text-sm focus:outline-none focus:border-blue-500"
              onKeyPress={(e) => e.key === 'Enter' && handleSavePreset()}
            />
            <button
              onClick={handleSavePreset}
              className="px-3 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded transition"
            >
              ✅ Save
            </button>
            <button
              onClick={() => {
                setShowForm(false);
                setPresetName('');
              }}
              className="px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white text-sm font-semibold rounded transition"
            >
              ❌ Cancel
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowForm(true)}
            className="w-full px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded transition"
          >
            💾 Save Current Config as Preset
          </button>
        )}
      </div>

      {/* Presets List */}
      {presets.length > 0 && (
        <div className="space-y-2">
          <p className="text-gray-300 text-xs font-semibold">Saved Presets:</p>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {presets.map((preset) => (
              <div
                key={preset.presetName}
                className="flex gap-2 p-2 bg-gray-800/50 border border-gray-600 rounded items-center justify-between text-sm"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-white font-semibold truncate">{preset.presetName}</p>
                  <p className="text-gray-400 text-xs">
                    {preset.language === 'es' ? '🇪🇸 Spanish' : '🇺🇸 English'} • {preset.wordLimit} words
                  </p>
                </div>
                <div className="flex gap-1 shrink-0">
                  <button
                    onClick={() => handleLoadPreset(preset)}
                    className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded transition"
                  >
                    📂 Load
                  </button>
                  <button
                    onClick={() => handleDeletePreset(preset.presetName)}
                    className="px-2 py-1 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded transition"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Export/Import */}
      <div className="flex gap-2 pt-2 border-t border-gray-700">
        <button
          onClick={handleExportCSV}
          disabled={presets.length === 0}
          className="flex-1 px-3 py-2 bg-green-700 hover:bg-green-800 disabled:bg-gray-700 text-white text-sm font-semibold rounded transition"
        >
          📥 Export CSV
        </button>
        <label className="flex-1 cursor-pointer">
          <input
            type="file"
            accept=".csv"
            onChange={handleImportCSV}
            className="hidden"
          />
          <span className="block px-3 py-2 bg-purple-700 hover:bg-purple-800 text-white text-sm font-semibold rounded transition text-center">
            📤 Import CSV
          </span>
        </label>
      </div>
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
