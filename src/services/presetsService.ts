export interface PresetConfig {
  name: string;
  candidateProfile: string;
  jobDescription: string;
  extraInstructions: string;
  language: string;
  wordLimit: number;
  timestamp: number;
}

const PRESETS_KEY = 'interview_presets';

export const presetsService = {
  // Get all presets
  getAllPresets: (): PresetConfig[] => {
    try {
      const data = localStorage.getItem(PRESETS_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  // Save a new preset
  savePreset: (config: Omit<PresetConfig, 'timestamp'>): void => {
    const presets = presetsService.getAllPresets();
    const newPreset: PresetConfig = {
      ...config,
      timestamp: Date.now(),
    };
    
    // Remove existing preset with same name if exists
    const filtered = presets.filter((p) => p.name !== config.name);
    filtered.push(newPreset);
    
    localStorage.setItem(PRESETS_KEY, JSON.stringify(filtered));
  },

  // Load a preset by name
  loadPreset: (name: string): PresetConfig | null => {
    const presets = presetsService.getAllPresets();
    return presets.find((p) => p.name === name) || null;
  },

  // Delete a preset by name
  deletePreset: (name: string): void => {
    const presets = presetsService.getAllPresets();
    const filtered = presets.filter((p) => p.name !== name);
    localStorage.setItem(PRESETS_KEY, JSON.stringify(filtered));
  },

  // Export presets to CSV
  exportToCSV: (): string => {
    const presets = presetsService.getAllPresets();
    
    if (presets.length === 0) {
      return 'name,candidateProfile,jobDescription,extraInstructions,language,wordLimit\n';
    }

    const csvHeader = 'name,candidateProfile,jobDescription,extraInstructions,language,wordLimit\n';
    
    const csvRows = presets.map((preset) => {
      return [
        `"${preset.name.replace(/"/g, '""')}"`,
        `"${preset.candidateProfile.replace(/"/g, '""')}"`,
        `"${preset.jobDescription.replace(/"/g, '""')}"`,
        `"${preset.extraInstructions.replace(/"/g, '""')}"`,
        preset.language,
        preset.wordLimit,
      ].join(',');
    });

    return csvHeader + csvRows.join('\n');
  },

  // Import presets from CSV
  importFromCSV: (csvText: string): void => {
    const lines = csvText.trim().split('\n');
    
    if (lines.length < 2) {
      throw new Error('Invalid CSV format');
    }

    const headers = lines[0].split(',').map((h) => h.trim());
    const presets = presetsService.getAllPresets();

    // Simple CSV parsing (handles quoted fields)
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      const values: string[] = [];
      let current = '';
      let inQuotes = false;

      for (let j = 0; j < line.length; j++) {
        const char = line[j];
        const nextChar = line[j + 1];

        if (char === '"' && nextChar === '"') {
          current += '"';
          j++; // Skip next quote
        } else if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          values.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
      values.push(current.trim());

      if (values.length >= 5) {
        const preset: PresetConfig = {
          name: values[0],
          candidateProfile: values[1],
          jobDescription: values[2],
          extraInstructions: values[3],
          language: values[4],
          wordLimit: parseInt(values[5]) || 150,
          timestamp: Date.now(),
        };

        // Remove existing preset with same name
        const filtered = presets.filter((p) => p.name !== preset.name);
        filtered.push(preset);
        presets.length = 0;
        presets.push(...filtered);
      }
    }

    localStorage.setItem(PRESETS_KEY, JSON.stringify(presets));
  },

  // Download CSV file
  downloadCSV: (): void => {
    const csv = presetsService.exportToCSV();
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `interview_presets_${Date.now()}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  },
};
